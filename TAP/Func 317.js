if (docData["STATUS"] === "FACTURÉ") {
  return { icon: "GRIS", color: "white", backgroundColor: "#9A9999" };
} else if (docData["STATUS"] === "EN COURS") {
  return { backgroundColor: "#D8AE55" };
} else if (docData["STATUS"] === "ARRIVÉ SUR PLACE") {
  return { backgroundColor: "#6BD855" };
} else if (docData["STATUS"] === "TERMINÉ") {
  return { icon: "mauve terminé", color: "white", backgroundColor: "#456FBA" };
} else if (docData["STATUS"] === "SOUMIS") {
  return { icon: "vert soumise", backgroundColor: "#94D694" };
} else if (docData["STATUS"] === "INACTIF") {
  return { icon: "rouge inactif", backgroundColor: "#CF5151" };
} else if (docData["STATUS"] === "ANNULÉ") {
  return { icon: "rouge indisponible", backgroundColor: "#eb6c6c" };
} else if (docData["STATUS"] === "À ATTRIBUER") {
  return { icon: "à attribuer", color: "white", backgroundColor: "#E12818" };
} else if (docData["STATUS"] === "ATTRIBUÉE") {
  return { icon: "attribuée", color: "white", backgroundColor: "#F6A400" };
} else if (docData["STATUS"] === "ENVOYÉE") {
  return { icon: "envoyé", color: "white", backgroundColor: "#F0D829" };
} else if (docData["STATUS"] === "AU DÉPART") {
  return { icon: "au départ", color: "white", backgroundColor: "#81EE06" };
} else if (docData["STATUS"] === "EMBARQUEMENT EN COURS") {
  return { icon: "embarquement", color: "white", backgroundColor: "#0FC80D" };
} else if (docData["STATUS"] === "EN CHARGE") {
  return { icon: "en charge", color: "white", backgroundColor: "#27E2E8" };
} else if (docData["STATUS"] === "DÉBARQUEMENT EN COURS") {
  return { icon: "débarquemenrt", color: "white", backgroundColor: "#27A2E8" };
} else if (docData["STATUS"] === "FIN DE MISSION") {
  return { icon: "fin de mission", color: "white", backgroundColor: "#EFDBF7" };
} else if (docData["STATUS"] === "COMPLÉTÉ") {
  return { icon: "cloturée", color: "white", backgroundColor: "#DBA3F3" };
} else if (docData["STATUS"] === "INDISPONIBLE") {
  return { icon: "indisponible", color: "white", backgroundColor: "#AFAFAF" };
} else if (docData["STATUS"] === "ACTIF") {
  return { backgroundColor: "#8fce00" };
} else if (docData["STATUS"] === "PLANIFIÉ") {
  return { backgroundColor: "#b1d8f2" };
} else if (docData["STATUS"] === "CONFIRMÉ") {
  return { backgroundColor: "#878fed" };
} else if (docData["STATUS"] === "MESSAGE AU CHAUFFEUR") {
  return { backgroundColor: "#E8D705" };
} else if (docData["STATUS"] === "CLOTURÉ") {
  return { backgroundColor: "#d9ead3" };
} else if (docData["STATUS"] === "Modèle") {
  return { backgroundColor: "#bcbcbc" };
} else if (docData["STATUS"] === "EN PAUSE") {
  return { backgroundColor: "#d9d2e9" };
} else if (docData["STATUS"] === "SOUMISE") {
  return { backgroundColor: "#9fc5e8" };
} else if (docData["STATUS"] === "À valider") {
  return { backgroundColor: "#ec963d" };
} else if (docData["STATUS"] === "VOYAGE BLANC") {
  return { backgroundColor: "#f3f2b4" };
}
else if (docData["STATUS"] === "MODÈLE") {
  return { backgroundColor: "#BCBCBC" };
}
