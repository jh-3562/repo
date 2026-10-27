//console.log("Function17", context);
let backgroundColor;
if (docData.Transport_TypeTransport === "Aller") {
  backgroundColor = "#3c9423ff";
}

if (docData.Transport_TypeTransport === "Retour") {
  backgroundColor = "#e90e0eff";
}

return { backgroundColor: backgroundColor };
