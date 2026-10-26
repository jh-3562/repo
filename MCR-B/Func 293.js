console.log("Function 293", context);

const isUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

const createOrUpdateElement = (id, tag, style, innerHTML = "") => {
  let element = document.getElementById(id);
  if (!element) {
    element = document.createElement(tag);
    element.id = id;
    document.body.appendChild(element);
  }
  element.style = style;
  element.innerHTML = innerHTML;
  return element;
};

const showWarningBanner = (message) => {
  const warningBanner = createOrUpdateElement(
    "warningBanner",
    "div",
    `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: auto;
      min-width: 300px;
      height: 50px;
      background-color: #fff3cd;
      color: #856404;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      border-radius: 5px;
      padding: 0 20px;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
      border: 1px solid #ffeeba;
    `,
    `
      <div style="margin-right: 10px;">⚠️</div>
      <div>${message}</div>
      <div id="warningBannerProgress"
           style="position: absolute; bottom: 0; left: 0; background-color: #856404; height: 4px; width: 0%;">
      </div>
    `,
  );

  const progressElement = document.getElementById("warningBannerProgress");
  let width = 0;

  const interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      warningBanner.style.display = "none";
    } else {
      width++;
      progressElement.style.width = width + "%";
    }
  }, 55);
};

const viewGroupUrl = () => {
  const parts = window.location.href.split("/");
  for (let i = 0; i < 3; i++) {
    const last = parts[parts.length - 1];
    if (isUUID(last) || last === "new") parts.pop();
  }
  return parts.join("/");
};

const redirectToViewGroup = () => {
  const { origin, pathname } = window.location;
  const segments = pathname.split("/").filter(Boolean);
  const tenant = segments[0];
  if (!tenant) {
    console.error("[redirectToViewGroup] Tenant not found in URL");
    return;
  }
  window.location.href = `${origin}/${tenant}/transports`;
};

const hidePopupLoading = () => {
  const loadingPopup = document.getElementById("loadingPopup");
  if (loadingPopup) loadingPopup.style.display = "none";
};

const showPopupLoading = (loadingMessage) => {
  createOrUpdateElement(
    "loadingPopup",
    "div",
    `
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `,
    `
      <div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: center;">
        <div>${loadingMessage}</div>
        <div class="loader" style="border: 6px solid #f3f3f3; border-top: 6px solid #3498db; border-radius: 50%; width: 40px; height: 40px; margin-top: 20px; animation: spin 1s linear infinite;"></div>
      </div>
    `,
  );
  if (!document.getElementById("spinnerStyle")) {
    const style = document.createElement("style");
    style.id = "spinnerStyle";
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
};

const showConfirmationPopup = (message) =>
  new Promise((resolve) => {
    const overlay = createOrUpdateElement(
      "confirmationPopup",
      "div",
      `
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      `,
      `
        <div style="background-color: white; padding: 20px; border-radius: 5px; max-width: 400px; text-align: center;">
          <div style="margin-bottom: 20px;">${message}</div>
          <div style="display: flex; justify-content: center; gap: 10px;">
            <button id="confirmPopupNo"  style="border: 2px solid #6c757d; background-color: #6c757d; color: #fff; padding: 8px 20px; border-radius: 8px; cursor: pointer;">Non</button>
            <button id="confirmPopupYes" style="border: 2px solid #3498db; background-color: #3498db; color: #fff; padding: 8px 20px; border-radius: 8px; cursor: pointer;">Oui</button>
          </div>
        </div>
      `,
    );

    const close = (result) => {
      overlay.style.display = "none";
      resolve(result);
    };

    document.getElementById("confirmPopupYes").onclick = () => close(true);
    document.getElementById("confirmPopupNo").onclick = () => close(false);
  });

const checkIfFormExist = async () => {
  try {
    const apiFilters = [
      {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Profil MCR",
        type: "TEXT",
      },
      {
        key: "Maison",
        operator: "EQUALS",
        value: docData.Maison,
        type: "TEXT",
      },
      { key: "STATUS", operator: "EQUALS", value: "Actif", type: "TEXT" },
    ];
    const res = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });
    const ids = res.data.ids;
    return ids && ids.length > 0 ? ids[0] : null;
  } catch (error) {
    console.error("Erreur lors de la verification du formulaire :", error);
    return undefined;
  }
};

const createForm = async () => {
  try {
    const response = await api({ local: true }).post("document", {
      document: {
        data: JSON.stringify(docData),
        status: "Actif",
        active: true,
        template: { templateId: "40307eab-5d1b-4ae2-adae-bcd79c11fcd5" },
      },
    });
    return response;
  } catch (error) {
    console.error("Erreur lors de la creation du formulaire :", error);
    throw error;
  }
};

const updateForm = async () => {
  try {
    const res = await api({ local: true }).put("document", {
      document: {
        data: JSON.stringify(docData),
        status: "Actif",
        active: true,
        template: { templateId: "40307eab-5d1b-4ae2-adae-bcd79c11fcd5" },
        documentID: docData.FORMID,
      },
    });
    return res;
  } catch (error) {
    console.error("Erreur lors de la mise a jour du formulaire :", error);
    throw error;
  }
};

const deactivateExistingForm = async (id) => {
  try {
    const fetchRes = await api({ local: true }).post("document/id", {
      ids: [id],
    });
    const existingDoc = fetchRes.data.documents[0];
    await api({ local: true }).put("document", {
      document: {
        data: existingDoc.data,
        status: "Supprimé(e)",
        active: true,
        template: { templateId: "40307eab-5d1b-4ae2-adae-bcd79c11fcd5" },
        documentID: id,
      },
    });
  } catch (error) {
    console.error(
      "Erreur lors de la desactivation du formulaire existant :",
      error,
    );
    throw error;
  }
};

const navigateBack = () => {
  const lastPage = localStorage.getItem("lastCustomPage");
  if (lastPage) {
    window.location.href = lastPage;
  } else {
    window.history.back();
  }
};

const main = async (docData) => {
  try {
    const currentRoles = store.moduleStore.user.roles;
    if (!currentRoles.includes("1. ADMIN")) {
      showWarningBanner(
        "Vous devez etre administrateur pour pouvoir modifier ce formulaire.",
      );
      return;
    }

    const status = docData.STATUS;

    if (status === "Actif") {
      showPopupLoading("Sauvegarde en cours...");
      await updateForm();
      hidePopupLoading();
      navigateBack();
      return;
    }

    // Draft
    showPopupLoading("Verification en cours...");
    const existingId = await checkIfFormExist();
    hidePopupLoading();

    if (!existingId) {
      showPopupLoading("Creation en cours...");
      await createForm();
      hidePopupLoading();
      navigateBack();
      return;
    }

    const confirmed = await showConfirmationPopup(
      "Un formulaire actif existe deja pour cette MCR. Voulez-vous le desactiver et enregistrer ce formulaire?",
    );
    if (!confirmed) return;

    showPopupLoading("Enregistrement en cours...");
    await deactivateExistingForm(existingId);
    await createForm();
    hidePopupLoading();
    navigateBack();
  } catch (error) {
    hidePopupLoading();
    showWarningBanner("Une erreur est survenue, veuillez reessayer.");
  }
};

window.addEventListener("popstate", hidePopupLoading);
window.addEventListener("hashchange", hidePopupLoading);

if (!isValidDocument(t, docData)) {
  main(docData);
}
