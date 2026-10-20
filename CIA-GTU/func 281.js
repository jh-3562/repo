const status = String(docData?.STATUS || docData?.User_Status || "")
  .trim()
  .toLowerCase();
const isDraft = status === "draft";

return {
  Formparametresdoptimisation_Buttons: ["draft", "actif", "inactif"].includes(
    status,
  )
    ? true
    : null,

  parametreCalcul_CreeParametreOpti: isDraft ? true : null,
  ParamaetresOptimisations_Annuler: null,
};
