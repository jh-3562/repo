console.log("Function 20", context);
const newData = {
  ...docData,
};
// here we call the gitlab function
const prices = calculatePrix(newData);
console.log("PRICES ", prices);
// Injection ou retour des résultats en fonction du contexte
if (context?.injectDocData) {
  injectDocData({
    fillData: {
      ...prices,
    },
  });
} else {
  return {
    ...prices,
  };
}
