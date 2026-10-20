console.log("Function 249", context);

const isInactif = docData.STATUS === "Inactif";
const isDraft = docData.STATUS === "Draft";

return {
  "Parametresd'otptimisation": isInactif ? null : true,
  EnregistrerParamOptim: isInactif || isDraft ? null : true,

};
