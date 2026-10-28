console.log("Function 527", context);

const isAllerRetour = docData["TypeTransport"] === "ALLER/RETOUR";

if (docData["STATUS"] === "VOYAGE BLANC") {
  return {
    startStopNumber: "",
    endStopNumber: "",
    startStopNumberRetour: "",
    endStopNumberRetour: "",
  };
}

return {
  startStopNumber: "1",
  endStopNumber: "2",
  startStopNumberRetour: isAllerRetour ? "4" : "",
  endStopNumberRetour: isAllerRetour ? "3" : "",
};