console.log("Function 220", context);

const isAAssigner = docData.STATUS === "À assigner";
const isRechercheEnCours = docData.STATUS === "Recherche en cours";
const isAssignee = docData.STATUS === "Assignée";

return {
  RechercheEnCoursListeRappel: isAAssigner ? true : null,
  ListeDeRappel_Assigner: isAssignee ? null : true,
  ListeDeRappel_Modifier: isAssignee ? true : null,
};
