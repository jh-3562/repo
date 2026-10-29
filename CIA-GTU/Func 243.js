const searchValue = String(docData[inputKey] || "").trim();
const carrier = String(docData.NomTransporteurSearch || "").trim();
const main = async () => {
  const result = { suggestions: { [inputKey]: [] } };
  try {
    if (searchValue && carrier) {
      const baseFilters = [
        { key: "FORMLAYOUTNAME", operator: "EQUALS", value: "Utilisateur", type: "TEXT" },
        { key: "Utilisateur_Role", operator: "EQUALS", value: "Chauffeur", type: "TEXT" },
        { key: "STATUS", operator: "EQUALS", value: "Actif", type: "TEXT" },
        { key: "NomTransporteurSearch", operator: "EQUALS", value: carrier, type: "TEXT" },
      ];
      const responses = await Promise.all(["Usager_NomComplet", "Utilisateur_Prenom", "Utilisateur_Nom"].map(key =>
        api({ local: true }).post("document/id/filter", { filters: [...baseFilters, { key, operator: "CONTAINS", value: searchValue, type: "TEXT" }] })));
      const ids = [...new Set(responses.flatMap(response => response?.data?.ids || []))];
      if (ids.length) {
        const response = await api({ local: true }).post("document/id", { ids });
        const suggestions = await Promise.all((response?.data?.documents || []).map(async document => {
          const data = JSON.parse(document.data);
          const username = String(data.Utilisateur_MethodeConnexion === "EntraID" ? data.Utilisateur_CodeWindows || "" : data.Utilisateur_Courriel || "").trim();
          const name = String(data.Usager_NomComplet || `${data.Utilisateur_Prenom || ""} ${data.Utilisateur_Nom || ""}`).trim();
          if (!username || !name) return null;
          try {
            const accountResponse = await api({ local: true }).get(`appuser/${encodeURIComponent(username)}`);
            const account = accountResponse?.data?.appUser;
            if (!account?.id || account.active === false || !(account.roles || []).includes("CHAUFFEUR")) return null;
            return {
              title: `${name} (${username})`,
              fields: [
                { key: "Répartition_NomChauffeur", name: "Nom du chauffeur", value: name },
                { key: "Répartition_ChauffeurId", name: "Compte chauffeur", value: account.id },
              ],
            };
          } catch { return null; }
        }));
        result.suggestions[inputKey] = suggestions.filter(Boolean);
      }
    }
  } finally { callback(result); }
};
return main();
