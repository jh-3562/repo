console.log("Function242", context);

let backgroundColor;
let color;

if (docData.Demande_StatutAccompagnateur ==="Assignée"){
 backgroundColor = "#C7F9CC"; 
}

if (docData.Demande_StatutAccompagnateur ==="Recherche en cours"){
 backgroundColor = "#FFFCD4"; 
}

if (docData.Demande_StatutAccompagnateur === "À assigner"){
  backgroundColor = "#D2E9F9";
}

return { backgroundColor: backgroundColor,
         color: color
};
