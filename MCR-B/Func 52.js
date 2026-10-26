console.log('Function 52', context);

const currentStatus = docData.STATUS;
if (currentStatus === "Draft") {
  return { TempsEmbarquement: "00:15", TempsDebarquement: "00:15" };
} else {
  return;
}
