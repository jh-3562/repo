console.log("Fonction 33", context);

const prov = docData?.Demande_TransportDetailsDemandeProvenanceUsager;
let typeTransport = docData?.Demande_TransportDetailsDemandeTypeTransport || null;
let typeTransport2= docData?.Demande_TransportDetailsDemandeTypeTransport2 || null;



const updates = {
  Demande_TransportDetailsDemandeTypeTransport: typeTransport,
  Demande_TransportDetailsDemandeTypeTransport2: typeTransport2,
};


if (prov != null && String(prov).trim() !== "") {
  updates.Demande_TransportDetailsDemandeSurvCliniqueTraitementPendantTransport = null;
  updates.Demande_TransportDetailsDemandeTypeTransporteurPrimaire = null;
  updates.Demande_TransportDetailsDemandeTypeTransporteurAlternatif1 = null;
  updates.Demande_TransportDetailsDemandeTypeTransporteurAlternatif2 = null;
}

return updates;
