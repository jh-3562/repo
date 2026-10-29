console.log("Function 85", context);

// ======================================================
// CONFIG
// ======================================================

const CONFIG = {
  REDIRECT_DEMANDES_URL: "/demandes",

  TEMPLATE_ID_CLIENT: "7e0a41c7-b3f3-4c91-aaad-461caf36cb2e",
  TEMPLATE_ID_DEMANDE: "dadaf75a-cd49-4cba-8060-2ac15155478f",
  FORMLAYOUTID_LISTE_RAPPEL: "da97587b-2bcd-4f01-a018-4b841796f6ae",

  FORM_LAYOUT: {
    CLIENT: "Usager",
  },

  IDENTIFIANT_BY_TYPE: {
    RAMQ: "Identite_RAMQ",
    "Carte santé d'une autre province": "Identite_NumeroAssuranceMaladie",
    "Assurance privée canadienne": "Identite_NumeroCarteAssurance",
    "Assurance privée étrangère": "Identite_NumeroCarteAssurance",
    "Sans assurance privée": "Identite_NumeroCarteAssurance",
  },
};

// ======================================================
// API HELPERS — NEW API CALLS
// ======================================================

const getDocumentIDsByFilters = async (apiFilters) => {
  try {
    const response = await api({ local: true }).post("document/id/filter", {
      filters: apiFilters,
    });

    return response?.data?.ids || [];
  } catch (error) {
    console.error("Failed to fetch document IDs:", error);
    return [];
  }
};

const getDocumentsByIDs = async (documentIDs) => {
  try {
    const response = await api({ local: true }).post("document/id", {
      ids: documentIDs,
    });

    return response?.data?.documents || [];
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return [];
  }
};

const createDocument = async (document) => {
  const response = await api({ local: true }).post("document", {
    document,
    preventNotify: "FULL",
  });

  return response?.data || null;
};

const createOrUpdate = async (document) => {
  const documentData = JSON.parse(document?.data || "{}");
  const isCreate = documentData?.NUMBER == null || documentData?.NUMBER === 0;
  const method = isCreate ? "post" : "put";
  const response = await api({ local: true })[method]("document", {
    document,
    preventNotify: "FULL",
  });

  return response?.data || null;
};

const updateDocument = async (document) => {
  const response = await api({ local: true }).put("document", {
    document,
    preventNotify: "FULL",
  });

  return response?.data || null;
};

const getGeneratedDocumentNumber = async (documentID) => {
  const document = (await getDocumentsByIDs([documentID]))?.[0];
  const number = document?.number;

  console.log("Document relu pour obtenir NUMBER:", document);

  if (number != null && Number(number) > 0) {
    return number;
  }

  return null;
};

// ======================================================
// SMALL UTILS
// ======================================================
const firstNonEmpty = (...values) => {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return "";
};

const toText = (value) => String(value ?? "").trim();

const toLowerText = (value) => toText(value).toLowerCase();

const isTrue = (value) => {
  const cleanValue = toLowerText(value);
  return value === true || ["true", "oui", "1", "yes"].includes(cleanValue);
};

const hasMeaningfulValue = (value) => toText(value) !== "";

const validateRAMQ = (ramq) => {
  const cleanRAMQ = toText(ramq).toUpperCase().replace(/\s+/g, "");
  return /^[A-Z]{4}\d{8}$/.test(cleanRAMQ);
};

// ======================================================
// UI HELPERS
// ======================================================

const showPopupMessage = (message, color = "#2ecc71", duration = 3000) => {
  let popup = document.getElementById("messagePopup");

  if (!popup) {
    popup = document.createElement("div");
    popup.id = "messagePopup";
    document.body.appendChild(popup);
  }

  popup.innerText = message;
  popup.style = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: ${color};
    color: white;
    padding: 15px 25px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 10000;
    font-size: 16px;
    transition: opacity 0.5s ease;
    opacity: 1;
  `;

  setTimeout(() => {
    popup.style.opacity = "0";
    setTimeout(() => popup.remove(), 500);
  }, duration);
};

const showBanner = (id, message, color, icon) => {
  const banner = createOrUpdateElement(
    id,
    "div",
    `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      width: auto;
      min-width: 300px;
      min-height: 50px;
      background-color: white;
      color: black;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      border-radius: 5px;
      padding: 0 20px;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    `,
    `
      <div style="margin-right: 10px; color: ${color};">${icon}</div>
      <div>${message}</div>
      <div id="${id}Progress" style="position: absolute; bottom: 0; left: 0; background-color: ${color}; height: 5px; width: 0%;"></div>
    `,
  );

  const progressElement = document.getElementById(`${id}Progress`);
  let width = 0;

  const interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      banner.style.display = "none";
      return;
    }

    width++;
    progressElement.style.width = `${width}%`;
  }, 55);
};

const showWarningPopup = (message) => {
  return new Promise((resolve) => {
    const overlay = createOrUpdateElement(
      "warningOverlay",
      "div",
      `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
      `,
    );

    overlay.innerHTML = `
      <div style="
        background: white;
        padding: 25px;
        border-radius: 8px;
        width: 380px;
        text-align: center;
        box-shadow: 0 0 10px rgba(0,0,0,0.3);
      ">
        <div style="font-size: 16px; margin-bottom: 20px;">
          ${message}
        </div>

        <button id="warningPopupOk"
          style="
            background: #2ecc71;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
          ">
          OK
        </button>
      </div>
    `;

    document.getElementById("warningPopupOk").onclick = () => {
      overlay.remove();
      resolve(true);
    };
  });
};

const showLevierConfirmationPopup = () => {
  return new Promise((resolve) => {
    showCustomPopup({
      title: "Confirmation",
      commentHTML:
        "Assurez-vous que l’établissement receveur <b>dispose d’un levier avant de confirmer</b>.<br><br>Voulez-vous continuer ?",
      buttons: [
        {
          name: "Non",
          backgroundColor: "#ffc9c9",
          color: "#1e1e1e",
          preset: "cancel",
          onClick: () => {
            console.log("Création annulée : levier non confirmé.");
            resolve(false);
          },
        },
        {
          name: "Oui",
          backgroundColor: "#b2f2bb",
          color: "#1e1e1e",
          onClick: () => {
            console.log("Levier confirmé.");
            resolve(true);
          },
        },
      ],
    });
  });
};

// ======================================================
// CLIENT LOGIC
// ======================================================

const getIdentifiantFromDemande = () => {
  const typeIdentification = docData.Identite_TypeIdentification;

  switch (typeIdentification) {
    case "RAMQ":
      return docData.Demande_IdentificationIdentificationUsagerRAMQ;

    case "Carte santé d'une autre province":
      return docData.Demande_NumeroAssuranceMaladie;

    case "Assurance privée canadienne":
    case "Assurance privée étrangère":
    case "Sans assurance privée":
      return docData.Demande_NumeroCarteAssurance;

    default:
      return "";
  }
};

const findExistingClient = async () => {
  const typeIdentification = docData.Identite_TypeIdentification;
  const identifiant = getIdentifiantFromDemande();
  const identifiantKey = CONFIG.IDENTIFIANT_BY_TYPE[typeIdentification];

  console.log("Recherche client existant :", {
    typeIdentification,
    identifiantKey,
    identifiant,
  });

  if (!hasMeaningfulValue(typeIdentification)) {
    console.warn("Recherche annulée : Identite_TypeIdentification est vide.");
    return null;
  }

  if (!identifiantKey) {
    console.warn("Recherche annulée : type d'identification non reconnu.");
    return null;
  }

  if (!hasMeaningfulValue(identifiant)) {
    console.warn("Recherche annulée : identifiant vide.");
    return null;
  }

  const filters = [
    {
      key: "FORMLAYOUTNAME",
      operator: "EQUALS",
      value: CONFIG.FORM_LAYOUT.CLIENT,
      type: "TEXT",
    },
    {
      key: "Identite_TypeIdentification",
      operator: "EQUALS",
      value: typeIdentification,
      type: "TEXT",
    },
    {
      key: identifiantKey,
      operator: "EQUALS",
      value: identifiant,
      type: "TEXT",
    },
  ];
  if (typeIdentification == "Carte santé d'une autre province") {
    filters.push({
      key: "Identite_Provenance",
      operator: "EQUALS",
      value: docData.Identite_Provenance,
      type: "TEXT",
    });
  }

  console.log("Filtres recherche client :", filters);

  const clientIDs = await getDocumentIDsByFilters(filters);

  console.log("IDs clients trouvés :", clientIDs);

  if (!clientIDs.length) {
    return null;
  }

  const clients = await getDocumentsByIDs(clientIDs);

  console.log("Documents clients trouvés :", clients);

  return clients?.[0] || null;
};

const buildClientData = () => {
  return {
    Identite_RAMQ: docData.Demande_IdentificationIdentificationUsagerRAMQ,
    Identite_Prenom:
      docData.Demande_IdentificationIdentificationUsagerPrenom ||
      docData.Identite_PrenomSearch,
    Identite_Nom:
      docData.Demande_IdentificationIdentificationUsagerNom ||
      docData.Identite_NomSearch,
    Identite_Sexe: docData.Demande_IdentificationIdentificationUsagerSexe,
    Identite_DateNaissance:
      docData.Demande_IdentificationIdentificationUsagerDateNaissance,
    Identite_Age: docData.Demande_IdentificationIdentificationUsagerAge,

    Demande_IdentificationIdentificationUsagerOxygenodependant:
      docData.Demande_IdentificationIdentificationUsagerOxygenodependant,
    Demande_IdentificationIdentificationUsagerDiabétique:
      docData.Demande_IdentificationIdentificationUsagerDiabétique,
    Demande_IdentificationIdentificationUsagerDebit:
      docData.Demande_IdentificationIdentificationUsagerDebit,
    Demande_IdentificationStatutDiabetiqueEstInsulinodependant:
      docData.Demande_IdentificationStatutDiabetiqueEstInsulinodependant,

    Identite_Langues: docData.Identite_Langues,
    Identification_LangueAutre: docData.Identification_LangueAutre,
    Identite_Telephone: docData.Identite_Telephone,
    Identite_Poste: docData.Identite_Poste,
    Identite_Adresse: docData.Identite_Adresse,
    Identite_Rue: docData.Identite_Rue,
    Identite_Civique: docData.Identite_Civique,
    Identite_Appartement: docData.Identite_Appartement,
    Identite_Ville: docData.Identite_Ville,
    Identite_Province: docData.Identite_Province,
    Identite_CodePostal: docData.Identite_CodePostal,
    Identite_AutreInfo: docData.Identite_AutreInfo,

    Demande_PPH: docData.Demande_PPH,
    Demande_IdentificationPoids: docData.Demande_IdentificationPoids,
    Identification_MesurePoids: docData.Identification_MesurePoids,
    Demande_TypeClientele: docData.Demande_TypeClientele,

    Identite_TypeIdentification: docData.Identite_TypeIdentification,
    Identite_Courriel: docData.Identite_Courriel,
    Identite_Expiration: docData.Identite_Expiration,
    Identite_Expiration_Required: docData.Identite_Expiration_Required,
    Identite_Provenance: docData.Identite_Provenance,

    Identite_NumeroAssuranceMaladie: docData.Demande_NumeroAssuranceMaladie,
    Identite_NumeroCarteAssurance: docData.Demande_NumeroCarteAssurance,
  };
};

const createClientIfNeeded = async () => {
  const shouldCreateClient = isTrue(
    docData.Demande_IdentificationUsagerNonexistant,
  );

  if (!shouldCreateClient) {
    console.log("Aucun client à créer.");
    return {
      cancelled: false,
      clientId: null,
    };
  }

  const typeIdentification = docData.Identite_TypeIdentification;
  const identifiant = getIdentifiantFromDemande();

  if (typeIdentification === "RAMQ" && !validateRAMQ(identifiant)) {
    throw new Error("RAMQ invalide");
  }

  const existingClient = await findExistingClient();

  if (existingClient) {
    console.warn("Création annulée : client déjà existant.", existingClient);

    return {
      cancelled: true,
      reason: "EXISTING_CLIENT",
      existingClient,
      clientId: null,
    };
  }

  showPopupLoading("Création du client…");

  const createdClient = await createOrUpdate({
    data: formatDataAPI_FASTER(buildClientData()),
    status: "Actif",
    active: true,
    template: {
      templateId: CONFIG.TEMPLATE_ID_CLIENT,
    },
  });

  const clientId = createdClient?.id || null;

  if (!clientId) {
    throw new Error("Création du client échouée");
  }

  showSuccessBanner("Client créé");

  return {
    cancelled: false,
    clientId,
  };
};

// ======================================================
// DEMANDE LOGIC
// ======================================================

const shouldShowOxygenWarning = (data) => {
  const rawValue = toLowerText(data.Demande_TransportAutreEquipements);

  return (
    isTrue(data.Demande_TransportAutreEquipements) ||
    rawValue.includes("bonbonne") ||
    rawValue.includes("oxyg")
  );
};

const shouldShowLevierConfirmation = (data) => {
  return isTrue(data.Demande_ToileLevier);
};

const isRecurrentRequest = (data) => {
  return isTrue(data.Demande_TransportInformationTransportAvecReccurence);
};

const createDemande = async (data) => {
  // [FIX DateDebut 2026-10-14] Garantir TransportSysteme_DateDebut a la soumission (cf. fonction 58).
  const _normalizeTime = (s) => {
    if (!s) return "";

    let t = String(s)
      .trim()
      .toLowerCase()
      .replace(/\s*h\s*/g, ":")
      .replace(/\s+/g, "");

    if (/^\d{3,4}$/.test(t)) {
      t = (t.length === 3 ? "0" + t : t).replace(
        /(\d{2})(\d{2})/,
        "$1:$2",
      );
    }

    const m = /^(\d{1,2}):(\d{1,2})$/.exec(t);

    if (!m) return "";

    const hh = String(
      Math.min(Math.max(+m[1], 0), 23),
    ).padStart(2, "0");

    const mm = String(
      Math.min(Math.max(+m[2], 0), 59),
    ).padStart(2, "0");

    return `${hh}:${mm}`;
  };

  const _recActive =
    data?.Demande_TransportInformationTransportAvecReccurence ===
      true ||
    data?.Demande_TransportInformationTransportAvecReccurence ===
      "true";

  const _baseDate =
    (_recActive &&
      data?.Demande_TransportInformationTransportDateDebutReccurence) ||
    data?.Demande_TransportTransportSimpleDateTransportDepart;

  const _heure = _normalizeTime(
    data?.Demande_TransportTransportSimpleHeureDepartSouhaitee,
  );

  if (_baseDate && _heure) {
    data.TransportSysteme_DateDebut =
      `${_baseDate}T${_heure}:00`;
  }
  // [FIN FIX DateDebut]

  // [FIX NomComplet 2026-10-14] Garantir Usager_NomComplet
  // a la soumission (cf. fonction 148).
  const _prenomUsager = String(
    data?.Identite_Prenom ||
      data?.Demande_IdentificationIdentificationUsagerPrenom ||
      "",
  ).trim();

  const _nomUsager = String(
    data?.Identite_Nom ||
      data?.Demande_IdentificationIdentificationUsagerNom ||
      "",
  ).trim();

  const _nomCompletUsager = [
    _prenomUsager,
    _nomUsager,
  ]
    .filter(Boolean)
    .join(" ");

  if (_nomCompletUsager) {
    data.Usager_NomComplet = _nomCompletUsager;
  }
  // [FIN FIX NomComplet]

  const isReccurence = isRecurrentRequest(data);
  const status = isReccurence ? "En traitement" : "Soumise";
  const { NUMBER, FORMID, documentID, id, ...newDemandeData } = data;

  const activeDocumentId =
    typeof store !== "undefined"
      ? store?.pageContentStore?.active?.[0] || ""
      : "";

  const existingDocumentId = String(
    activeDocumentId || FORMID || documentID || "",
  ).trim();

  let existingDocumentNumber = Number(
    NUMBER ||
      data?.number ||
      data?.Numero ||
      data?.numero ||
      data?.SystemeCache_Nombre ||
      0,
  );

  if (existingDocumentId && existingDocumentNumber <= 0) {
    existingDocumentNumber =
      Number(
        await getGeneratedDocumentNumber(existingDocumentId),
      ) || 0;
  }

  /*
   * Un brouillon existant doit devenir une demande avec le même
   * identifiant et le même numéro. Il ne faut pas refaire un POST.
   */
  if (existingDocumentId && existingDocumentNumber > 0) {
    const submittedData = {
      ...data,
      NUMBER: existingDocumentNumber,
      SystemeCache_Nombre: String(existingDocumentNumber),
    };

    const updatedDemande = await updateDocument({
      documentID: existingDocumentId,
      data: formatDataAPI_FASTER(submittedData),
      status,
      active: true,
      template: {
        templateId: CONFIG.TEMPLATE_ID_DEMANDE,
      },
    });

    console.log("Brouillon converti en demande :", {
      id: existingDocumentId,
      number: existingDocumentNumber,
      status,
      response: updatedDemande,
    });

    return {
      id: existingDocumentId,
      number: existingDocumentNumber,
    };
  }

  /*
   * Nouvelle demande sans numéro existant :
   * conserver le flux original de création par POST.
   */
  const savedDemande = await createDocument({
    data: formatDataAPI_FASTER(newDemandeData),
    status,
    active: true,
    template: {
      templateId: CONFIG.TEMPLATE_ID_DEMANDE,
    },
  });

  console.log("Saved demande:", savedDemande);

  const demandeId = savedDemande?.id ?? null;

  if (!demandeId) {
    throw new Error("Enregistrement de la demande échoué");
  }

  const demandeNumber = await getGeneratedDocumentNumber(demandeId);

  if (demandeNumber == null) {
    throw new Error("Le numéro de la demande n'a pas été généré");
  }

  await updateDocument({
    documentID: demandeId,
    data: formatDataAPI_FASTER({
      ...data,
      NUMBER: demandeNumber,
      SystemeCache_Nombre: String(demandeNumber),
    }),
    status,
    active: true,
    template: {
      templateId: CONFIG.TEMPLATE_ID_DEMANDE,
    },
  });

  return {
    id: demandeId,
    number: demandeNumber,
  };
};

const createListeDeRappel = async (demandeId, data) => {
  const createdListe = await createOrUpdate({
    data: formatDataAPI_FASTER({
      ...data,
      ListeDeRappel_FormIDAssocier: demandeId,
      STATUS: "À assigner",
    }),
    status: "À assigner",
    active: true,
    template: {
      templateId: CONFIG.FORMLAYOUTID_LISTE_RAPPEL,
    },
  });

  return createdListe;
};

// ======================================================
// MAIN
// ======================================================

async function main() {
  try {
    showPopupLoading("Validation de la demande…");

    const invalidField = await isValidDocument(t, docData);

    console.log("Validation document :", invalidField);

    if (invalidField) {
      hidePopupLoading();
      return;
    }

    showPopupLoading("Préparation de la demande…");

    const clientResult = await createClientIfNeeded();

    if (clientResult?.cancelled && clientResult?.reason === "EXISTING_CLIENT") {
      hidePopupLoading();

      await showWarningPopup(
        "Un client existe déjà avec ces informations d'identification. Veuillez annuler cette création et sélectionner le client existant via la recherche plutôt que de créer un nouveau client.",
      );

      return;
    }

    const clientId = clientResult?.clientId || null;

    const dataWithClient = clientId
      ? {
          ...docData,
          SystemeCache_ClientId: clientId,
        }
      : {
          ...docData,
        };

    if (shouldShowOxygenWarning(dataWithClient)) {
      hidePopupLoading();

      await showWarningPopup(
        "S'assurer que la bonbonne soit remplie pour le transport.",
      );

      showPopupLoading("Création de la demande…");
    }

    if (shouldShowLevierConfirmation(dataWithClient)) {
      hidePopupLoading();

      const confirmed = await showLevierConfirmationPopup();

      if (!confirmed) {
        hidePopupLoading();
        showPopupMessage("Création de la demande annulée.", "#e74c3c");
        return;
      }

      showPopupLoading("Création de la demande…");
    }

     const dataWithAssignment = {
      ...dataWithClient,

      Répartition_ChauffeurIdentityId: firstNonEmpty(
        dataWithClient.Répartition_ChauffeurIdentityId,
        dataWithClient.Repartition_ChauffeurIdentityId,
        dataWithClient.Répartition_ChauffeurId,
        dataWithClient.Repartition_ChauffeurId,
      ),

      Répartition_ChauffeurLogin: firstNonEmpty(
        dataWithClient.Répartition_ChauffeurLogin,
        dataWithClient.Repartition_ChauffeurLogin,
        dataWithClient.Répartition_ChauffeurCourriel,
        dataWithClient.Repartition_ChauffeurCourriel,
      ),

      Répartition_NomChauffeur: firstNonEmpty(
        dataWithClient.Répartition_NomChauffeur,
        dataWithClient.Repartition_NomChauffeur,
      ),
    };

    const hasAssignedName = hasMeaningfulValue(
      dataWithAssignment.Répartition_NomChauffeur,
    );
    const hasAssignedId = hasMeaningfulValue(
      dataWithAssignment.Répartition_ChauffeurIdentityId,
    );
    const hasAssignedLogin = hasMeaningfulValue(
      dataWithAssignment.Répartition_ChauffeurLogin,
    );

    if (hasAssignedName && !hasAssignedId && !hasAssignedLogin) {
      throw new Error(
        "Assignation chauffeur incomplète : Répartition_ChauffeurIdentityId ou Répartition_ChauffeurLogin est requis.",
      );
    }

    const demande = await createDemande(dataWithAssignment);

    const ACCOMPAGNATEUR =
      dataWithAssignment.Demande_TransportAccompagnementQuiFourniAccompagnateur;

    if (ACCOMPAGNATEUR === "Liste de rappel") {
      await createListeDeRappel(demande.id, dataWithAssignment);
    }

    hidePopupLoading();

    showSuccessBanner(`Demande #${demande.number} créée avec succès.`);

    setTimeout(() => {
      window.location.href = CONFIG.REDIRECT_DEMANDES_URL;
    }, 2000);
  } catch (error) {
    console.error("Erreur Function 85 :", error);

    hidePopupLoading();

    showErrorBanner(
      error?.message || "Erreur lors de la création de la demande",
    );
  }
}

main();
