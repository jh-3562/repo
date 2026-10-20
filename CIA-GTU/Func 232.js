console.log("Function 232", context);

const isRefusee = docData.STATUS === "Refusée";
const isPlanifiee = docData.STATUS === "Planifiée";
const isConfirmee = docData.STATUS === "Confirmée";
const isSoumise = docData.STATUS === "Soumise";
const isDraft = docData.STATUS === "Draft";
const isAnnulee = docData.STATUS === "Annulée";
const userRoles = store?.moduleStore?.user?.roles || [];
const secondaryStatus = docData["Demande_StatutAccompagnateur"];
const isTransportSimple =
  docData["Demande_TransportInformationTransportTransportAllerRetour"] !==
  "true";

const isDepartement = userRoles.includes("DÉPARTEMENT");
const isNotTransporteur = !userRoles.includes("TRANSPORTEUR");
const isTransporteur = userRoles.includes("TRANSPORTEUR");
const isAdmin = userRoles.includes("ADMIN");
const isRepartiteur = userRoles.includes("RÉPARTITEUR");
const isChauffeur = userRoles.includes("CHAUFFEUR");
const hasRolesAccess = isAdmin || isRepartiteur;
const hasTransporteurAccess =
  isAdmin || isRepartiteur || isChauffeur || isTransporteur;
const statusEnTransport = [
  "Confirmée",
  "Prise en charge",
  "En route",
  "En route - Aller",
  "Arrivé à destination",
  "En attente",
].includes(docData.STATUS);

return {
  Demande_Brouilllon: isDraft ? true : null,
  Demande_CreerClient: isDraft ? true : null,
  Demande_Annuler: isNotTransporteur
    ? isDepartement
      ? isSoumise && secondaryStatus === "À assigner"
        ? true
        : null
      : isRefusee || isPlanifiee || isConfirmee || isSoumise
        ? true
        : null
    : null,
  Demande_Planifier: isSoumise || isRefusee ? true : null,
  Demande_Soumise: isSoumise || isRefusee ? true : null,
  RecalculerLesHeures: null,
  arrive_pour_prise_en_charge:
    docData.STATUS === "Confirmée" && hasTransporteurAccess ? true : null,
  depart:
    docData.STATUS === "Prise en charge" &&
    isTransportSimple &&
    hasTransporteurAccess
      ? true
      : null,
  depart_aller:
    docData.STATUS === "Prise en charge" &&
    !isTransportSimple &&
    hasTransporteurAccess
      ? true
      : null,
  arrive_a_destination:
    docData.STATUS === "En route - Aller" && hasTransporteurAccess
      ? true
      : null,
  attendre_usager:
    docData.STATUS === "Arrivé à destination" && hasTransporteurAccess
      ? true
      : null,
  depart_retour:
    (docData.STATUS === "Arrivé à destination" ||
      docData.STATUS === "En attente") &&
    hasTransporteurAccess
      ? true
      : null,
  completer:
    (docData.STATUS === "En route" || docData.STATUS === "En route - Retour") &&
    hasTransporteurAccess
      ? true
      : null,
  signaler_attente_imprevue:
    statusEnTransport && hasTransporteurAccess ? true : null,
  fin_attente_imprevue:
    docData.STATUS === "Attente imprévue" && hasTransporteurAccess
      ? true
      : null,
};
