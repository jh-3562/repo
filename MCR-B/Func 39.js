console.log("Function 39", context);

//recup les infos (Date,heuredebut,heurefin)
function getInfos() {
  //champs
  const date = docData.Planification_Date;
  const heureDebut = docData.Planification_HeureDébut;
  const heureFin = docData.Planification_HeureFin;
  //heure mis ensemble
  let dateavecHeureDebut = date + "T" + heureDebut + ":00";
  let dateavecHeureFin = date + "T" + heureFin + ":00";

  if (
    docData.Planification_Récurrence == "Une seule fois" ||
    docData.IdentifiantFormulaireRécurrence
  ) {
    if (date && heureDebut && heureFin) {
      return {
        InformationsAdmin_DateHeureDébut: dateavecHeureDebut,
        InformationsAdmin_DateHeureFin: dateavecHeureFin,
      };
    }
  } else {
    if (docData.Planification_Récurrence == "Par semaine") {
      if (docData.Planification_DateFin) {
        const dateFin = docData.Planification_DateFin;
        let dateavecHeureFin = dateFin + "T" + heureFin + ":00";
        return {
          InformationsAdmin_DateHeureDébut: dateavecHeureDebut,
          InformationsAdmin_DateHeureFin: dateavecHeureFin,
        };
      } else {
        return {
          InformationsAdmin_DateHeureDébut: dateavecHeureDebut,
          InformationsAdmin_DateHeureFin: "2150-01-01T00:00:00",
        };
      }
    } else {
      if (docData.Planification_Récurrence == "Par jour spécifique") {
        if (docData.Planification_MultiDate) {
          const multiDate = docData.Planification_MultiDate.split("|");
          const latestDate = multiDate.reduce((latest, current) => {
            return new Date(current) > new Date(latest) ? current : latest;
          });
          const earliestDate = multiDate.reduce((earliest, current) => {
            return new Date(current) < new Date(earliest) ? current : earliest;
          });
          let dateavecHeureDebut = earliestDate + "T" + heureDebut + ":00";
          let dateavecHeureFin = latestDate + "T" + heureFin + ":00";
          return {
            InformationsAdmin_DateHeureDébut: dateavecHeureDebut,
            InformationsAdmin_DateHeureFin: dateavecHeureFin,
          };
        }
      }
    }
  }
}
const result = getInfos();

return result;
