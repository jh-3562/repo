if (docData["FORMLAYOUTNAME"] === "Disponibilité") {
  if (docData.Planification_Disponiblité === "Disponible") {
    return {
      backgroundColor: "#D9DAF2",
      color: "#141972",
      borderColor: "#6E71AF"
    };
  } else {
    return {
      backgroundColor: "#E9E9F3",
      color: "#545799",
      borderColor: "#C9CAE1"
    };
  }
}
if (docData["FORMLAYOUTNAME"] === "Véhicule") {
  return {
    backgroundColor: "#D3D3D3",
  };
}
