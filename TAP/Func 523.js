console.log("Function 523",context);

const n = 50; // nombre d'options

const options = Array.from({ length: n }, (_, i) => {
  const value = (i + 1).toString();
  return {
    label: value,
    value: value,
    text: value,
  };
});

callback({
  options: {
    PositionDomicileChauffeur: options
  }
});