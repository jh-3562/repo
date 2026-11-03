console.log("Fonction 455", context);

const mapping = [
  { from: "StatutInventaire", to: "1L_Statut" },
  { from: "NoUniqueInventaire", to: "1L_NumFinal" },
  { from: "Description_Autocomplete", to: "1L_Description" },
  { from: "IDAideTechnique", to: "1L_Name" },
  { from: "BIN", to: "1L_BIN" },
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
if (docData["1L_Description"]) {
  api({ local: true })
    .post(
      `suggestion?fieldID=${"af269bee-019f-445d-8ae1-e9b3549a0a65"}&fieldValue=${docData["1L_Description"]}`,
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
            "1L_Description": sorted.map((s) => ({
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
          data: { "1L_StatutFinal": "Attribué" },
        });
      } else {
        callback({ suggestions: { "1L_Description": [] } });
      }
    });
} else {
  callback([]);
}
