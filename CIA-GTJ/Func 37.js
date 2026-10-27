console.log("Function37", context);
let backgroundColor;
if (docData.STATUS === "Complété") {
  backgroundColor = "#c9dfc3";
}

if (docData.STATUS === "Optimisé") {
  backgroundColor = "#c6d0f6";
}
if (docData.STATUS === "Confirmé") {
  backgroundColor = "#e5cbe6";
}

return { backgroundColor: backgroundColor };
