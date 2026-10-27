console.log("Fonction 16", context);

let result = {};


if (docData?.Transport_AvecRecurrence != 'true') {

  const type = docData?.Transport_TypeTransport;

  const buildDateTime = (date, heure) => {
    if (!date || !heure) return "";
    return `${date} ${heure}`;
  };


  if (type === 'Aller') {
    result.Demande_DateHeureDebut = buildDateTime(
      docData?.DemandeAllerD_Date,
      docData?.DemandeAllerD_Heure
    );

    result.Demande_DateHeureFin = buildDateTime(
      docData?.DemandeAllerA_Date,
      docData?.DemandeAllerA_Heure
    );
  }


  if (type === 'Retour') {
    result.Demande_DateHeureDebut = buildDateTime(
      docData?.DemandeRetourD_Date,
      docData?.DemandeRetourD_Heure
    );

    result.Demande_DateHeureFin = buildDateTime(
      docData?.DemandeRetourA_Date,
      docData?.DemandeRetourA_Heure
    );
  }
}
console.log("Result: ", result);
return result;
