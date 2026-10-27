console.log("Fonction 125", context);

const data = docData.Transport_Precisions?.includes("Rien à signaler")
  ? { Transport_Precisions: "Rien à signaler" }
  : "";

callback({
  data,
});

callback({
  data,
});
