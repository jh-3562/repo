console.log("Function 127", context);

if (
  (docData.Planification_Récurrence === "Par semaine" ||
    docData.Planification_Récurrence === "Par jour spécifique") &&
  docData.STATUS !== "Draft"
) {
  return {
    Planification_Date: "true",
    Planification_DateFin: "true",
    Planification_MultiDate: "true",
    Planification_Récurrence: "true",
    Planification_Répéter: "true",
  };
}
