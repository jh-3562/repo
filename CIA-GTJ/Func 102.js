console.log("Fonction 102", context);

const DEMANDE_TEMPLATE_ID = "5d7b4e39-c50a-428c-87ec-e9b68ac45e39";
const TRANSPORT_TEMPLATE_ID = "017d9a14-b828-4cc5-8a9a-8906c1fcab59";
const DEMANDE_STATUS = "En traitement";
const TRANSPORT_STATUS = "Soumis";

const safeParse = (raw) => {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const buildDateTime = (date, heure) => {
  const d = String(date || "").trim();
  const h = String(heure || "").trim();

  if (!d || !h) return null;

  const [hh = "00", mm = "00"] = h.split(":");
  return `${d}T${hh.padStart(2, "0")}:${mm.padStart(2, "0")}:00`;
};

const buildApprovalDateTime = () => {
  const now = new Date();

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}T${hh}:${min}:00`;
};

const createDocument = async (templateId, dataObj, statusOverride) => {
  const response = await api({ local: true }).post("document", {
    document: {
      data: JSON.stringify(dataObj),
      status: statusOverride,
      active: true,
      template: { templateId },
    },
    preventNotify: "FULL",
  });

  const id = response?.data?.id;
  const number = response?.data?.number ?? "";
  const status =
    response?.data?.status ??
    response?.data?.document?.status ??
    statusOverride;

  if (!id) {
    throw new Error("Création échouée : id manquant.");
  }

  return { id, number, status, raw: response?.data };
};

const updateDocumentMany = async (
  documentId,
  templateId,
  statusKey,
  dataObj,
) => {
  const documents = [
    {
      data: JSON.stringify(dataObj),
      status: statusKey,
      active: true,
      template: { templateId },
      documentID: documentId,
    },
  ];

  await api({ local: true }).put("document/Many", { documents });
};

const getDocumentData = async (documentId) => {
  const res = await api({ local: true }).get(`document/${documentId}`);
  const raw = res?.data?.data ?? res?.data?.document?.data ?? "{}";
  return safeParse(raw);
};

const buildUsagerComplet = (localDocData) => {
  const nom = String(
    localDocData?.Demande_IdentificationIdentficationUsagerNom || "",
  ).trim();

  const prenom = String(
    localDocData?.Demande_IdentificationIdentficationUsagerPrénom || "",
  ).trim();

  const age = String(
    localDocData?.Demande_IdentificationIdentficationUsagerÂge || "",
  ).trim();

  const dossier = String(
    localDocData?.Demande_IdentificationIdentficationUsagerNuméroDossierPIJ ||
      "",
  ).trim();

  if (nom && prenom && age && dossier) {
    return `${nom}, ${prenom} (${age}), #${dossier}`;
  }
  if (nom && prenom && age) {
    return `${nom}, ${prenom} (${age})`;
  }
  if (nom && prenom) {
    return `${nom}, ${prenom}`;
  }

  return nom || prenom || "";
};

const buildDepartAller = (localDocData) => {
  const nomLieu = String(localDocData?.DemandeAllerD_NomDuLieu || "").trim();
  const adresse = String(localDocData?.DemandeAllerD_Adresse || "").trim();
  const ville = String(localDocData?.DemandeAllerD_Ville || "").trim();
  const telephone = String(localDocData?.DemandeAllerD_Telephone || "").trim();

  if (nomLieu && adresse && ville && telephone) {
    return `${nomLieu}, ${adresse} ${ville}, #${telephone}`;
  }
  if (nomLieu && adresse && ville) {
    return `${nomLieu}, ${adresse} ${ville}`;
  }
  if (nomLieu && adresse) {
    return `${nomLieu}, ${adresse}`;
  }

  return nomLieu || "";
};

const buildDestinationAller = (localDocData) => {
  const nomLieu = String(localDocData?.DemandeAllerA_NomDuLieu || "").trim();
  const adresse = String(localDocData?.DemandeAllerA_Adresse || "").trim();
  const ville = String(localDocData?.DemandeAllerA_Ville || "").trim();
  const telephone = String(localDocData?.DemandeAllerA_Telephone || "").trim();

  if (nomLieu && adresse && ville && telephone) {
    return `${nomLieu}, ${adresse} ${ville}, #${telephone}`;
  }
  if (nomLieu && adresse && ville) {
    return `${nomLieu}, ${adresse} ${ville}`;
  }
  if (nomLieu && adresse) {
    return `${nomLieu}, ${adresse}`;
  }

  return nomLieu || "";
};

const buildDepartRetour = (localDocData) => {
  const nomLieu = String(localDocData?.DemandeRetourD_NomDuLieu || "").trim();
  const adresse = String(localDocData?.DemandeRetourD_Adresse || "").trim();
  const ville = String(localDocData?.DemandeRetourD_Ville || "").trim();
  const telephone = String(localDocData?.DemandeRetourD_Telephone || "").trim();

  if (nomLieu && adresse && ville && telephone) {
    return `${nomLieu}, ${adresse} ${ville}, #${telephone}`;
  }
  if (nomLieu && adresse && ville) {
    return `${nomLieu}, ${adresse} ${ville}`;
  }
  if (nomLieu && adresse) {
    return `${nomLieu}, ${adresse}`;
  }

  return nomLieu || "";
};

const buildDestinationRetour = (localDocData) => {
  const nomLieu = String(localDocData?.DemandeRetourA_NomDuLieu || "").trim();
  const adresse = String(localDocData?.DemandeRetourA_Adresse || "").trim();
  const ville = String(localDocData?.DemandeRetourA_Ville || "").trim();
  const telephone = String(localDocData?.DemandeRetourA_Telephone || "").trim();

  if (nomLieu && adresse && ville && telephone) {
    return `${nomLieu}, ${adresse} ${ville}, #${telephone}`;
  }
  if (nomLieu && adresse && ville) {
    return `${nomLieu}, ${adresse} ${ville}`;
  }
  if (nomLieu && adresse) {
    return `${nomLieu}, ${adresse}`;
  }

  return nomLieu || "";
};

const buildTransportPayload = (localDocData, kind) => {
  const intervenant = [
    localDocData?.Demande_IdentificationIdentificationPrénomIntervenant || "",
    localDocData?.Demande_IdentificationIdentificationNomIntervenant || "",
  ]
    .map((v) => String(v).trim())
    .filter(Boolean)
    .join(" ");

  const usagerComplet = buildUsagerComplet(localDocData);

  const base = {
    ...localDocData,
    Transport_TypeTransport: kind,
    SectionCache_Intervenant: intervenant,
    Usager_Complet: usagerComplet,
  };

  if (kind === "Aller") {
    return {
      ...base,
      SectionCache_DistanceDuTransport: localDocData?.Demande_TrajetAller || "",
      SectionCache_AdresseDepart: localDocData?.DemandeAllerD_Adresse || "",
      SectionCache_AdresseDestination:
        localDocData?.DemandeAllerA_Adresse || "",
      Demande_DateHeureDebut: buildDateTime(
        localDocData?.DemandeAllerD_Date,
        localDocData?.DemandeAllerD_Heure,
      ),
      Demande_DateHeureFin: buildDateTime(
        localDocData?.DemandeAllerA_Date,
        localDocData?.DemandeAllerA_Heure,
      ),
      Transport_DepartLatitude: localDocData?.Transport_Latitude || "",
      Transport_DepartLongitude: localDocData?.Transport_Longitude || "",
      Transport_DestinationLatitude:
        localDocData?.Transport_LatitudeAllerA || "",
      Transport_DestinationLongitude:
        localDocData?.Transport_LongitudeAllerA || "",
      FeuilleRoute_DepartAller: buildDepartAller(localDocData),
      FeuilleRoute_DestinationAller: buildDestinationAller(localDocData),
    };
  }

  return {
    ...base,
    SectionCache_DistanceDuTransport: localDocData?.Demande_TrajetRetour || "",
    SectionCache_AdresseDepart: localDocData?.DemandeRetourD_Adresse || "",
    SectionCache_AdresseDestination: localDocData?.DemandeRetourA_Adresse || "",
    Demande_DateHeureDebut: buildDateTime(
      localDocData?.DemandeRetourD_Date,
      localDocData?.DemandeRetourD_Heure,
    ),
    Demande_DateHeureFin: buildDateTime(
      localDocData?.DemandeRetourA_Date,
      localDocData?.DemandeRetourA_Heure,
    ),
    Transport_DepartLatitude: localDocData?.Transport_LatitudeRetourD || "",
    Transport_DepartLongitude: localDocData?.Transport_LongitudeRetourD || "",
    Transport_DestinationLatitude:
      localDocData?.Transport_LatitudeRetourA || "",
    Transport_DestinationLongitude:
      localDocData?.Transport_LongitudeRetourA || "",
    FeuilleRoute_DepartRetour: buildDepartRetour(localDocData),
    FeuilleRoute_DestinationRetour: buildDestinationRetour(localDocData),
  };
};

(async () => {
  try {
    showPopupLoading("Envoi du courriel et création des transports...");

    const prenom =
      docData?.Demande_IdentificationIdentificationPrénomIntervenant || "";

    const nom =
      docData?.Demande_IdentificationIdentificationProgrammeIntervenant || "";

    const email =
      docData?.Demande_IdentificationIdentificationCourrielIntervenant || "";

    const numero = docData?.NUMBER || "";
    const lien = window.location.href;
    const documentId = docData?.FORMID || docData?.id || context?.formId || "";

    if (!documentId) {
      throw new Error("ID du formulaire demande introuvable.");
    }

    const currentData = await getDocumentData(documentId);
    const localDocData = { ...currentData };

    const type = String(localDocData?.Transport_TypeTransport || "").trim();

    if (!type) {
      throw new Error("Transport_TypeTransport est vide.");
    }

    const html = `
      <p>Bonjour ${prenom} ${nom},</p>
      <p>Votre demande <a href="${lien}">#${numero}</a> a été approuvée.</p>
      <p>Merci,</p>
      <p>L'équipe de la Direction de la protection de la jeunesse</p>
    `;

    await fetch(
      N8N_SENDEMAILAPPROUVER,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          sujet: `Demande #${numero} approuvée`,
          html,
          numero,
          prenom,
          nom,
          lien,
        }),
      },
    );

    let idTransportAller = "";
    let idTransportRetour = "";
    let payloadAller = null;
    let payloadRetour = null;

    if (type === "Aller") {
      payloadAller = buildTransportPayload(localDocData, "Aller");
      const resAller = await createDocument(
        TRANSPORT_TEMPLATE_ID,
        payloadAller,
        TRANSPORT_STATUS,
      );
      idTransportAller = resAller.id;
    } else if (type === "Retour") {
      payloadRetour = buildTransportPayload(localDocData, "Retour");
      const resRetour = await createDocument(
        TRANSPORT_TEMPLATE_ID,
        payloadRetour,
        TRANSPORT_STATUS,
      );
      idTransportRetour = resRetour.id;
    } else if (type === "Aller/Retour") {
      payloadAller = buildTransportPayload(localDocData, "Aller");
      const resAller = await createDocument(
        TRANSPORT_TEMPLATE_ID,
        payloadAller,
        TRANSPORT_STATUS,
      );
      idTransportAller = resAller.id;

      payloadRetour = buildTransportPayload(localDocData, "Retour");
      const resRetour = await createDocument(
        TRANSPORT_TEMPLATE_ID,
        payloadRetour,
        TRANSPORT_STATUS,
      );
      idTransportRetour = resRetour.id;
    } else {
      throw new Error("Transport_TypeTransport invalide.");
    }

    await updateDocumentMany(documentId, DEMANDE_TEMPLATE_ID, DEMANDE_STATUS, {
      ...localDocData,
      Demande_IDTransportAller: idTransportAller,
      Demande_IDTransportRetour: idTransportRetour,
      Demande_StatutTransportAller: idTransportAller ? TRANSPORT_STATUS : "",
      Demande_StatutTransportRetour: idTransportRetour ? TRANSPORT_STATUS : "",
      Demande_DateTraitement: new Date().toISOString(),
      Demande_DateHeureApprobation: buildApprovalDateTime(),
      Demande_UtilisateurApprobateur: docData.USER,
    });

    if (idTransportAller) {
      await updateDocumentMany(
        idTransportAller,
        TRANSPORT_TEMPLATE_ID,
        TRANSPORT_STATUS,
        {
          ...(payloadAller || buildTransportPayload(localDocData, "Aller")),
          Transport_IDDemande: documentId,
          Transport_Nombre: numero,
        },
      );
    }

    if (idTransportRetour) {
      await updateDocumentMany(
        idTransportRetour,
        TRANSPORT_TEMPLATE_ID,
        TRANSPORT_STATUS,
        {
          ...(payloadRetour || buildTransportPayload(localDocData, "Retour")),
          Transport_IDDemande: documentId,
          Transport_Nombre: numero,
        },
      );
    }

    hidePopupLoading();
    showSuccessBanner("Courriel envoyé et transports créés avec succès.");
  } catch (error) {
    hidePopupLoading();
    console.error(error);
    showErrorBanner(error?.message || "Erreur lors du traitement.");
  }
})();

return {};
