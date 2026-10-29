const status = String(docData?.STATUS || docData?.User_Status || "")
  .trim()
  .toLowerCase();
const isDraft = status === "draft";
const isActif = status === "actif"

return {
  parametreCalcul_CreeParametreOpti: isDraft ? true : null,
  ParametresOptimisation_Actif : !isDraft && !isActif  ? true : null,
  RendreInactif: null,
};
