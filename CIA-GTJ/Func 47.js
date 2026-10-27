console.log("FUNCTION 47", context);

const idDemande = docData.Transport_IDDemande || "";

const baseUrl = window.location.origin;
//console.log("baseUrl", baseUrl);

const lien = idDemande ? `${baseUrl}/demandes/${idDemande}` : "";

return {
  Transport_LienDemande: lien,
};
