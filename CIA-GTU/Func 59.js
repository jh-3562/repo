console.log("Fonction 59", context);

const TARGET_FORMLAYOUTID = "3c0b9af1-fb35-4ee9-bcc7-394aa9a580a1";
const FIELD_DEBUT = "TransportSysteme_DateDebut";
const FIELD_FIN   = "TransportSysteme_DateFin";

if (docData?.FORMLAYOUTID === TARGET_FORMLAYOUTID) {
  return {
    [FIELD_DEBUT]: "2000-09-11T09:00:00",
    [FIELD_FIN]:   "2100-09-11T09:00:00"
  };
}

return {};
