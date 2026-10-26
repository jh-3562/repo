function ifExist(key, defaultValue) {
  return docData[key] ? docData[key] : defaultValue;
}

return {
  Categorie_Priorite: ifExist("Categorie_Priorite", "0"),
};
