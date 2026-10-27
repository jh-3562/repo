console.log("Fonction 2", context);

const precisions = docData.Transport_Precisions ? docData.Transport_Precisions : ""
const precision =
  (precisions).includes("Autres (remarque)") ;

//console.log(docData.Transport_Precisions)
//console.log("2-Precision",precision)
return {
  transport_Remarque: precision ? "true" : null
};
