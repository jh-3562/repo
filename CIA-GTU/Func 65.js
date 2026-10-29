const ABITIBI_FORMLAYOUTID_TRANSPORTEUR = "3c0b9af1-fb35-4ee9-bcc7-394aa9a580a1";
const currentLayout = docData?.TEMPORARY_FORMLAYOUTID || docData?.FORMLAYOUTID;

if (currentLayout === ABITIBI_FORMLAYOUTID_TRANSPORTEUR) {
  return {
    FormTransporteur_InformationSection: null,
    
  };
}
return {};

