console.log('Function 55', context);

if (docData["Planification_Disponiblité"] === "Disponible") {
  return {
    backgroundColor: "#D9DAF2",
      color: "#141972",
      borderColor: "#6E71AF"
  };
} else {
  return {
    backgroundColor: "#ffbfaa ",
      color: "#ad2d03",
      borderColor: "#ad2d03"
  };
}

