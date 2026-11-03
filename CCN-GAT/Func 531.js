console.log("Fonction 531", context);

const mapping = [
  { from: "StatutInventaire", to: "10L_Statut" },
  { from: "NoUniqueInventaire", to: "10L_NumFinal" },
  { from: "Description_Autocomplete", to: "10L_Description" },
  { from: "IDAideTechnique", to: "10L_Name" },
  { from: "BIN", to: "10L_BIN" },
];
const filters = [
  {
    key: "StatutInventaire",
    operator: "IN",
    value: "DISPONIBLE",
    type: "SELECT",
  },
  { key: "STATUS", operator: "EQUALS", value: "ACTIF", type: "TEXT" },
];
if (docData["10L_Description"]) {
  api({
    local: true,
  })
    .post(
      `suggestion?fieldID=${"af269bee-019f-445d-8ae1-e9b3549a0a65"}&fieldValue=${docData["10L_Description"]}`,
      { filters },
    )
    .then((res) => {
      if (res?.data?.suggestions?.length > 0) {
        // Sort suggestions: no stars first, then 1 star, then 2 stars (**)
        const sorted = res.data?.suggestions.sort((a, b) => {
          const aNum =
            a?.autoFill?.find((af) => af.key === "NoUniqueInventaire")?.value ||
            "";
          const bNum =
            b?.autoFill?.find((af) => af.key === "NoUniqueInventaire")?.value ||
            "";
          const aStars = (aNum.match(/\*+$/) || [""])[0].length;
          const bStars = (bNum.match(/\*+$/) || [""])[0].length;
          return aStars - bStars; // 0 stars first, then 1, then 2
        });
        callback({
          suggestions: {
            "10L_Description": sorted.map((s) => ({
              title: s?.value,
              fields: s?.autoFill
                ?.filter((a) => mapping.map((m) => m.from).includes(a.key))
                .map((a) => ({
                  ...a,
                  value: a.value || "",
                  key: mapping.find((m) => m.from === a.key).to,
                })),
            })),
          },
          data: { "10L_StatutFinal": "Attribué" },
        });
      } else {
        callback({ suggestions: { "10L_Description": [] } });
      }
    });
} else {
  callback({ suggestions: { "10L_Description": [] } });
}
