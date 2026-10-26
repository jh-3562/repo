console.log('Function 135', context);
const { CoorFactu_Qualité, FORMLAYOUTID } = docData;
const isBeneficiaire = CoorFactu_Qualité === "Bénéficiaire";
const prenomByForm = {
    "0e44171d-1616-4a50-9b36-aff4d998c4a5": "PrénomSelected",
    "3da52cab-039f-4a19-93ce-c904fe1e2ef0": "Prénom",
    "81e43068-2f10-426b-b78b-dfd855136bd5": "PrénomSelected",
}
const nomByForm = {
    "0e44171d-1616-4a50-9b36-aff4d998c4a5": "NomFormMission",
    "3da52cab-039f-4a19-93ce-c904fe1e2ef0": "Nom",
    "81e43068-2f10-426b-b78b-dfd855136bd5": "Nom",
};

const fields = isBeneficiaire ? 
    {
        CoorFactu_Prénom: docData[prenomByForm[FORMLAYOUTID]] || '',
        CoorFactu_Nom: docData[nomByForm[FORMLAYOUTID]] || '',
    } 
    : {};

return fields;