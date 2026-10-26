console.log("Function137", context);
return (docData.FORMLAYOUTID === "0e44171d-1616-4a50-9b36-aff4d998c4a5" ||
  docData.FORMLAYOUTID === "3da52cab-039f-4a19-93ce-c904fe1e2ef0" ||
  docData.FORMLAYOUTID === "81e43068-2f10-426b-b78b-dfd855136bd5") &&
  docData.AllocataireSocial === "true"
  ? { dateValiditeAttestationMututelle: true }
  : { dateValiditeAttestationMututelle: null };
