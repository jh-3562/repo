console.log("Function140", context);

if (docData.STATUS === "Draft" || docData.STATUS === "Acceptée") {
  return {};
} else {
  return {
    Planification_Récurrence: true,
  };
}
