console.log("Fonction 90", context);

const FORMLAYOUTID = "83b870bf-197a-4d47-96b0-a9df225b43b8";
const FORMID = docData?.FORMID;

const main = async () => {
  createOrUpdateDocument(FORMLAYOUTID, "Actif", FORMID, context);
};

main();
