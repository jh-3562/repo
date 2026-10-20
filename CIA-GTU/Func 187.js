console.log("Fonction 187", context);

const status = docData?.STATUS;

const showSection = status === "Soumise" ? true : false;

return {
  Demande_BatchSoumise: showSection,
};
