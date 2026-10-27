if (docData["STATUS"] === "En traitement") {
  return {
    backgroundColor: "#a5d8ff",
  };
} else if (docData["STATUS"] === "Refusé") {
  return {
    backgroundColor: "#e7b6b5",
  };
} else if (docData["STATUS"] === "Confirmé") {
  return {
    backgroundColor: "#e5cbe6",
  };
} else if (docData["STATUS"] === "Annulé") {
  return {
    backgroundColor: "#d78584",
  };
} else if (docData["STATUS"] === "Complété") {
  return {
    backgroundColor: "#c9e0c3",
  };
}
