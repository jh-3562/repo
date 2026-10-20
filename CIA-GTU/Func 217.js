console.log("Function 217", context);

const result = {};
const ACCOMPAGNATEUR = docData["Demande_TransportAccompagnementQuiFourniAccompagnateur"];

if (ACCOMPAGNATEUR === "Liste de rappel") {
  result["Demande_StatutAccompagnateur"] = "À assigner";
} else {
  result["Demande_StatutAccompagnateur"] = "Non applicable";
}

callback({ data: result });
callback({ data: result });
