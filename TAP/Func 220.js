const c1 = parseFloat(docData["Total_cout"]) || 0;
const c2 = parseFloat(docData["Ajustement"]) || 0.00;
const c3 = parseFloat(docData["Factu_Cout_Divers"]) || 0;
const c4 = parseFloat(docData["Factu_ParkingTotal"]) || 0;
const c5 = parseFloat(docData["Dons_client"]) || 0;


if (parseFloat(docData['Ajustement'])) {
    return {Grand_Total: `${(c1 - c5 + c3 + c4 + c2).toFixed(2)}`};
};
