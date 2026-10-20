console.log(
  "Fonction 45 - Remplir Liste de Rappel depuis Transport/Identification",
  context,
);

const result = {};
const get = (o, k) => o?.[k];
const need = get(
  docData,
  "Demande_TransportAccompagnementQuiFourniAccompagnateur",
);
const rolesAutorises = ["RÉPARTITEUR", "ADMIN"];
const userRoles = store.moduleStore.user.roles;
const estAutorise = rolesAutorises.some((role) => userRoles.includes(role));
const dateDuJour = new Date().toISOString().split("T")[0];

if (!estAutorise) {
  const dateSimpleDepart =
    docData["Demande_TransportTransportSimpleDateTransportDepart"];
  const dateRetourDepart =
    docData["Demande_TransportTransportRetourDateTransportDepart"];
  if (dateSimpleDepart && dateSimpleDepart < dateDuJour) {
    result["Demande_TransportTransportSimpleDateTransportDepart"] = "";
    result["Demande_TransportTransportSimpleDateTransportArrivee"] = "";
    showErrorBanner("La date de transport ne peut pas être dans le passé.");
  } else if (dateRetourDepart && dateRetourDepart < dateDuJour) {
    result["Demande_TransportTransportRetourDateTransportDepart"] = "";
    result["Demande_TransportTransportRetourDateTransportArrivee"] = "";
    showErrorBanner("La date de transport ne peut pas être dans le passé.");
  }
}

if (need === "Liste de rappel") {
  const map = [
    // Identification demandeur (depuis Transport)
    [
      "Demande_ListeRappelIdentificationDemandeurEstAutreDemandeur",
      "Demande_TransportIdentificationDemandeurEstAutreDemandeur",
    ],
    [
      "Demande_ListeRappelIdentificationDemandeurPrenomDemandeur",
      "Demande_TransportIdentificationDemandeurPrenomDemandeur",
    ],
    [
      "Demande_ListeRappelIdentificationDemandeurNomDemandeur",
      "Demande_TransportIdentificationDemandeurNomDemandeur",
    ],
    [
      "Demande_ListeRappelIdentificationDemandeurTelephoneDemandeur",
      "Demande_TransportIdentificationDemandeurTelephoneDemandeur",
    ],
    [
      "Demande_ListeRappelIdentificationDemandeurCourrielDemandeur",
      "Demande_TransportIdentificationDemandeurCourrielDemandeur",
    ],

    [
      "Demande_ListeRappelIdentificationDemandeurPrenom",
      "Demande_TransportIdentificationDemandeurPrenom",
    ],
    [
      "Demande_ListeRappelIdentificationDemandeurNom",
      "Demande_TransportIdentificationDemandeurNom",
    ],
    [
      "Demande_ListeRappelIdentificationDemandeurTelephone",
      "Demande_TransportIdentificationDemandeurTelephone",
    ],
    [
      "Demande_ListeRappelIdentificationDemandeurCourriel",
      "Demande_TransportIdentificationDemandeurCourriel",
    ],
    [
      "Demande_ListeRappelIdentificationDemandeurCentreUniteAImputer",
      "Demande_TransportIdentificationDemandeurCentreUniteAImputer",
    ],
    [
      "Demande_ListeRappelIdentificationDemandeurPosteDemandeur",
      "Demande_TransportIdentificationDemandeurPosteDemandeur",
    ],
    [
      "Demande_ListeRappelIdentificationDemandeurPoste",
      "Demande_TransportIdentificationDemandeurPoste",
    ],

    // Usager (depuis Identification)
    [
      "Demande_ListeRappelIdentificationUsagerNomUsager",
      "Demande_IdentificationIdentificationUsagerNom",
    ],
    [
      "Demande_ListeRappelIdentificationUsagerPrenomUsager",
      "Demande_IdentificationIdentificationUsagerPrenom",
    ],
    [
      "Demande_ListeRappelIdentificationUsagerNumeroDossier",
      "Demande_IdentificationIdentificationUsagerNoDossier",
    ],
    [
      "Demande_ListeRappelIdentificationUsagerRamq",
      "Demande_IdentificationIdentificationUsagerRAMQ",
    ],

    // Accompagnement (depuis Transport)
    [
      "Demande_ListeRappelAccompagnementTypeAccompagnateurRequis",
      "Demande_TransportAccompagnementTypeAccompagnateurRequis",
    ],
    [
      "Demande_ListeRappelAccompagnementPrenomAccompagnateur",
      "Demande_TransportAccompagnementPrenomAccompagnateur",
    ],
    [
      "Demande_ListeRappelAccompagnementNomAccompagnateur",
      "Demande_TransportAccompagnementNomAccompagnateur",
    ],
    [
      "Demande_ListeRappelAccompagnementAutresInformations",
      "Demande_TransportAccompagnementAutresInformations",
    ],
    [
      "Demande_ListeRappelAccompagnementUsagerBesoinRaccompagne",
      "Demande_TransportAccompagnementUsagerBesoinRaccompagne",
    ],
    [
      "Demande_ListeRappelAccompagnementQuiFourniAccompagnateur",
      "Demande_TransportAccompagnementQuiFourniAccompagnateur",
    ],

    // Transport simple
    [
      "Demande_ListeRappelTransportSimpleDateTransportDepart",
      "Demande_TransportTransportSimpleDateTransportDepart",
    ],
    [
      "Demande_ListeRappelTransportSimpleHeureDepartSouhaitee",
      "Demande_TransportTransportSimpleHeureDepartSouhaitee",
    ],
    [
      "Demande_ListeRappelTransportSimpleDateTransportArrivee",
      "Demande_TransportTransportSimpleDateTransportArrivee",
    ],
    [
      "Demande_ListeRappelTransportSimpleHeureArriveeSouhaite",
      "Demande_TransportTransportSimpleHeureArriveeSouhaite",
    ],
    [
      "Demande_ListeRappelTransportSimpleNomLieuDepart",
      "Demande_TransportTransportSimpleNomLieuDepart",
    ],
    [
      "Demande_ListeRappelTransportSimpleNomLieuDestination",
      "Demande_TransportTransportSimpleNomLieuDestination",
    ],
    [
      "Demande_ListeRappelTransportSimpleAdresseCompleteDepart",
      "Demande_TransportTransportSimpleAdresseCompleteDepart",
    ],
    [
      "Demande_ListeRappelTransportSimpleAdresseCompleteDestination",
      "Demande_TransportTransportSimpleAdresseCompleteDestination",
    ],
    [
      "Demande_ListeRappelTransportSimpleUnitePriseEnChargeDepart",
      "Demande_TransportTransportSimpleUnitePriseEnChargeDepart",
    ],
    [
      "Demande_ListeRappelTransportSimpleNumeroAdresseDepart",
      "Demande_TransportTransportSimpleNumeroAdresseDepart",
    ],
    [
      "Demande_ListeRappelTransportSimpleUnitePriseEnChargeArrivee",
      "Demande_TransportTransportSimpleUnitePriseEnChargeArrivee",
    ],
    [
      "Demande_ListeRappelTransportSimpleNumeroAdresseArrivee",
      "Demande_TransportTransportSimpleNumeroAdresseArrivee",
    ],
    [
      "Demande_ListeRappelTransportSimpleNumeroTelephone1Depart",
      "Demande_TransportTransportSimpleNumeroTelephone1Depart",
    ],
    [
      "Demande_ListeRappelTransportSimpleNumeroTelephone2Depart",
      "Demande_TransportTransportSimpleNumeroTelephone2Depart",
    ],
    [
      "Demande_ListeRappelTransportSimpleNumeroTelephone1Arrivee",
      "Demande_TransportTransportSimpleNumeroTelephone1Arrivee",
    ],
    [
      "Demande_ListeRappelTransportSimpleNumeroTelephone2Arrivee",
      "Demande_TransportTransportSimpleNumeroTelephone2Arrivee",
    ],

    // Transport retour
    [
      "Demande_ListeRappelTransportRetourDateTransportDepart",
      "Demande_TransportTransportRetourDateTransportDepart",
    ],
    [
      "Demande_ListeRappelTransportRetourHeureDepartSouhaitee",
      "Demande_TransportTransportRetourHeureDepartSouhaitee",
    ],
    [
      "Demande_ListeRappelTransportRetourDateTransportArrivee",
      "Demande_TransportTransportRetourDateTransportArrivee",
    ],
    [
      "Demande_ListeRappelTransportRetourHeureArriveeSouhaite",
      "Demande_TransportTransportRetourHeureArriveeSouhaite",
    ],
    [
      "Demande_ListeRappelTransportRetourAdresseDepartEstDifferente",
      "Demande_TransportTransportRetourAdresseDepartEstDifferente",
    ],
    [
      "Demande_ListeRappelTransportRetourAdresseDestinationEstDifferente",
      "Demande_TransportTransportRetourAdresseDestinationEstDifferente",
    ],
    [
      "Demande_ListeRappelTransportRetourNomLieuDepart",
      "Demande_TransportTransportRetourNomLieuDepart",
    ],
    [
      "Demande_ListeRappelTransportRetourNomLieuDestination",
      "Demande_TransportTransportRetourNomLieuDestination",
    ],
    [
      "Demande_ListeRappelTransportRetourAdresseCompleteDepart",
      "Demande_TransportTransportRetourAdresseCompleteDepart",
    ],
    [
      "Demande_ListeRappelTransportRetourAdresseCompleteDestination",
      "Demande_TransportTransportRetourAdresseCompleteDestination",
    ],
    [
      "Demande_ListeRappelTransportRetourUnitePriseEnChargeDepart",
      "Demande_TransportTransportRetourUnitePriseEnChargeDepart",
    ],
    [
      "Demande_ListeRappelTransportRetourNumeroAdresseDepart",
      "Demande_TransportTransportRetourNumeroAdresseDepart",
    ],
    [
      "Demande_ListeRappelTransportRetourUnitePriseEnChargeArrivee",
      "Demande_TransportTransportRetourUnitePriseEnChargeArrivee",
    ],
    [
      "Demande_ListeRappelTransportRetourNumeroAdresseArrivee",
      "Demande_TransportTransportRetourNumeroAdresseArrivee",
    ],
    [
      "Demande_ListeRappelTransportRetourNumeroTelephone1Depart",
      "Demande_TransportTransportRetourNumeroTelephone1Depart",
    ],
    [
      "Demande_ListeRappelTransportRetourNumeroTelephone2Depart",
      "Demande_TransportTransportRetourNumeroTelephone2Depart",
    ],
    [
      "Demande_ListeRappelTransportRetourNumeroTelephone1Arrivee",
      "Demande_TransportTransportRetourNumeroTelephone1Arrivee",
    ],
    [
      "Demande_ListeRappelTransportRetourNumeroTelephone2Arrivee",
      "Demande_TransportTransportRetourNumeroTelephone2Arrivee",
    ],
  ];

  for (const [target, source] of map) {
    result[target] = get(docData, source) ?? null;
  }
}

callback({
  data: result,
});
callback({
  data: result,
});
