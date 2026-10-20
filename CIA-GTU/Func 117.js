console.log("Fonction 117", context);

const mode = docData?.STATUS;


const showSection =
  mode === "Draft" 
    ? null
    : true;

return {
  ListeDeRappel_Boutons: showSection
};
