const readonlyIfNotDraft = docData.STATUS !== "Draft" ? true : null;

return {
  Categorie_Nom: readonlyIfNotDraft,
};
