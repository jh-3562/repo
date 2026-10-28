let totalPrice = 0.0;
if (docData["Cout_KM"] || docData["Cout_divers"] || docData["COut_parking"]) {
    totalPrice = totalPrice + (parseFloat(docData["Cout_KM"])||0) + (parseFloat(docData["Cout_divers"])||0) + (parseFloat(docData["COut_parking"])||0);
    return { 'Total_cout': `${totalPrice.toFixed(2)}` }
}
else { undefined };