console.log("Function 198", context);
const fieldIdNomTransporteur = "24b4400c-6631-46b9-8ab6-457837159b6c";
const fieldKeyNomTransporteur = "NomTransporteurSearch";

const FORMLAYOUTID = "a9eaa665-43df-418c-91ce-c35d78992807";

const safeStr = (v) => String(v ?? "").trim();

const highlightFields = (keys) => {
  (keys || []).forEach((k) => {
    const el = document.getElementById(k);
    if (el) {
      el.style.outline = "2px solid #e74c3c";
      el.style.borderColor = "#e74c3c";
      el.addEventListener(
        "input",
        () => {
          el.style.outline = "";
          el.style.borderColor = "";
        },
        { once: true },
      );
    }
  });
};

const DataCollection = (key, array) => {
  const result = {};
  const itemCount = array?.length || 0;

  (array || []).forEach((obj, index) => {
    Object.keys(obj || {}).forEach((k) => {
      result[`${k}|${index + 1}`] = obj[k];
    });
  });

  result[key] = String(itemCount);
  return result;
};

const excludeKeys = (obj, keys) =>
  Object.keys(obj || {}).reduce((result, k) => {
    if (!keys.includes(k)) result[k] = obj[k];
    return result;
  }, {});

const formatDataAPI = (data) => {
  let out = { ...(data || {}) };

  Object.keys(out).forEach((k) => {
    if (Array.isArray(out[k])) {
      out = { ...out, ...DataCollection(k, out[k]) };
    }
  });

  return JSON.stringify(excludeKeys(out, ["FORMID", "NUMBER"]));
};

const extractApiError = (err) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.response?.data?.title ||
  err?.message ||
  "Erreur inconnue";

const createUser = async (identity) => {
  try {
    console.log("identifying", identity);

    const res = await fetch(N8N_CREATE_USER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identity,
      }),
    });
    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`CreateUser failed ${res.status}: ${errorBody}`);
    }

    return res;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

function generateTemporaryPassword(length = 14) {
  if (length < 8) {
    throw new Error("Le mot de passe doit faire au moins 8 caractères");
  }

  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%^&*_-";

  const all = upper + lower + numbers + symbols;

  const cryptoObj = globalThis.crypto || require("crypto").webcrypto;

  function randomChar(chars) {
    const array = new Uint32Array(1);
    cryptoObj.getRandomValues(array);
    return chars[array[0] % chars.length];
  }

  // Garantit chaque catégorie
  const password = [
    randomChar(upper),
    randomChar(lower),
    randomChar(numbers),
    randomChar(symbols),
  ];

  // Complète le reste
  while (password.length < length) {
    password.push(randomChar(all));
  }

  // Mélange sécurisé (Fisher-Yates)
  for (let i = password.length - 1; i > 0; i--) {
    const array = new Uint32Array(1);
    cryptoObj.getRandomValues(array);

    const j = array[0] % (i + 1);

    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
}

const isStrongPassword = (pwd) => {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[!@#$%^&*_\-]/.test(pwd);

  return (
    pwd.length >= minLength && hasUpper && hasLower && hasNumber && hasSpecial
  );
};

const getUserID = async (email) => {
  try {
    const res = await api({ local: true }).get(`appuser/${encodeURIComponent(email)}`);

    if (res.status === 200) {
      return res.data.appUser.id;
    } else {
      console.error("Failed to fetch user ID:", res);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user ID:", error);
    throw error;
  }
};

const setUserFilter = async (userID, key, value) => {
  try {
    const userFilter = {
      userFilter: {
        dtoName: "UserFilter",
        userID: userID,
        key: key,
        value: value,
        operator: "EQUALS",
        editable: "false",
      },
    };

    const res = await api({ local: true }).post("userfilter", userFilter);

    if (res.status === 201) {
      console.log("User filter successfully set.");
    } else {
      console.error("Failed to set user filter:", res);
    }
  } catch (error) {
    console.error("Error setting user filter:", error);
    throw error;
  }
};

async function callWebhook(url, payload) {
  async function doFetch(targetUrl) {
    return fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

  try {
    const res = await doFetch(url);
    console.log("res:", res);
    if (!res.ok) throw new Error(`Prod HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    try {
      console.log("Prod failed, fallback test:", err.message);

      const resTest = await doFetch(url.replace("/webhook/", "/webhook-test/"));
      if (!resTest.ok) throw new Error(`Test HTTP ${resTest.status}`);

      return await resTest.text();
    } catch (error) {
      console.log(error);
    }
  }
}

async function main() {
  console.log("docData :", docData);

  const connectionMethod = safeStr(docData.Utilisateur_MethodeConnexion);
  const username =
    connectionMethod === "EntraID"
      ? safeStr(docData.Utilisateur_CodeWindows)
      : safeStr(docData.Utilisateur_Courriel);
  const role = safeStr(docData.Utilisateur_Role).toUpperCase();
  const passwordForEmail = safeStr(docData.Utilisateur_MotDePasse);
  const isExternal = connectionMethod === "EntraID" ? "true" : "false";
  const isCreate = safeStr(docData.NUMBER) === "0";
  docData.Usager_NomComplet =
    `${docData["Utilisateur_Prenom"]} ${docData["Utilisateur_Nom"]}`.trim();

  let invalidFields = [];

  if (isCreate && !passwordForEmail) {
    invalidFields.push("Utilisateur_MotDePasse");
  } else if (isCreate && !isStrongPassword(passwordForEmail)) {
    invalidFields.push("Utilisateur_MotDePasse");
  }

  if (isValidDocument(t, docData)) return;

  if (Array.isArray(invalidFields) && invalidFields.length > 0) {
    const passwordInvalid = invalidFields.includes("Utilisateur_MotDePasse");
    showErrorBanner(
      passwordInvalid
        ? "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
        : `Validation échouée: ${invalidFields.length} champ(s) invalide(s).\nCorrige-les avant de continuer.`,
    );
    highlightFields(invalidFields);
    return;
  }

  showPopupLoading(
    isCreate
      ? "Création de l'utilisateur..."
      : "Mise à jour de l'utiliateur...",
  );

  try {
    //const passwordForEmail = generateTemporaryPassword();
    if (isCreate) {
      const identity = {
        dtoName: "Identity",
        new: "true",
        external: isExternal,
        username: username,
        token: passwordForEmail,
        roles: [role],
      };
      await createUser(identity);
    }

    const documentPayload = {
      data: formatDataAPI(docData),
      status: "Actif",
      active: true,
      template: { templateId: FORMLAYOUTID },
      ...(isCreate ? {} : { documentID: safeStr(docData.FORMID) }),
    };

    const res = isCreate
      ? await api({ local: true }).post("document", {
          document: documentPayload,
          preventNotify: "FULL",
        })
      : await api({ local: true }).put("document", {
          document: documentPayload,
          preventNotify: "FULL",
        });

    const userID = await getUserID(username);
    if (!userID) {
      throw new Error("User not found");
    }

    if (role === "CHAUFFEUR") {
      await setUserFilter(userID, "Répartition_ChauffeurId", userID);
    }

    if (docData["NomTransporteurSearch"]) {
      await setUserFilter(
        userID,
        fieldKeyNomTransporteur,
        docData["NomTransporteurSearch"],
      );
    }

    if (isCreate) {
      const htmlMessage = `<table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="background-color:#f4f4f4; padding:40px 0; font-family:Arial, Helvetica, sans-serif;"
        >
        <tr>
            <td align="center">
            <table
                width="600"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="background-color:#ffffff; border-radius:8px; overflow:hidden;"
            >
                <tr>
                <td
                    style="background-color:#1f2937; padding:30px; text-align:center;"
                >
                    <h1 style="color:#ffffff; margin:0; font-size:28px;">Fastercom</h1>
                </td>
                </tr>

                <tr>
                <td style="padding:40px; color:#333333; line-height:1.6;">
                    <p style="margin-top:0;">Bonjour,</p>

                    <p>
                    Un nouveau compte a été créé pour vous sur la plateforme
                    <strong>FasterSanté</strong>.
                    </p>

                    <p>
                    Veuillez trouver ci-dessous vos informations de connexion
                    temporaires :
                    </p>

                    <table
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    width="100%"
                    style="margin:25px 0; background-color:#f9fafb; border:1px solid #e5e7eb; border-radius:6px;"
                    >
                    <tr>
                        <td style="padding:20px;">
                        <p style="margin:0 0 10px 0;">
                            <strong>Nom d'utilisateur :</strong>

                            ${username}
                        </p>

                        <p style="margin:0;">
                            <strong>Mot de passe temporaire :</strong>

                            ${passwordForEmail}
                        </p>
                        </td>
                    </tr>
                    </table>

                    <p>
                    Pour des raisons de sécurité, ce mot de passe est
                    <strong>temporaire</strong> et devra être modifié lors de votre
                    première connexion.
                    </p>

                    <p style="text-align:center; margin:35px 0;">
                    <a
                        href="https://${window.location.hostname}/public/login"
                        style="
                        background-color:#2563eb;
                        color:#ffffff;
                        text-decoration:none;
                        padding:14px 28px;
                        border-radius:6px;
                        display:inline-block;
                        font-weight:bold;
                        "
                    >
                        Accéder à mon compte
                    </a>
                    </p>

                    <p>
                    Si vous avez besoin d’assistance, veuillez communiquer avec notre
                    équipe de support.
                    </p>

                    <p style="margin-bottom:0;">
                    Cordialement,

                    L’équipe FasterSanté
                    </p>
                </td>
                </tr>
            </table>
            </td>
        </tr>
        </table>
      `;

      await callWebhook(N8N_SEND_EMAIL, {
        email: username,
        subjectLine: "Nouveau compte",
        messageHTML: htmlMessage,
      });
    }

    hidePopupLoading();
    //console.log("API response: ", res);
    showSuccessBanner(
      isCreate ? "Utilisateur créé." : "Utilisateur mis à jour.",
    );

    const currentPath = window.location.pathname;
    const basePath = currentPath.substring(0, currentPath.indexOf("/new/"));
    window.location.href = "donnees/Utilisateurs_Chauffeurs";
  } catch (err) {
    hidePopupLoading();
    console.log("API ERROR:", err);
    showErrorBanner(
      `${isCreate ? "Erreur lors de la création" : "Erreur lors de la mise à jour"}:\n${extractApiError(err)}`,
    );
  }
}

main();
