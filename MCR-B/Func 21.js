console.log('Function 21', context);


if(docData.CE_CatégorieMission && docData.CE_DébutDeValidité && docData.CE_FinDeValidité) {
    let titre = `${docData.CE_CatégorieMission} (${docData.CE_DébutDeValidité} à ${docData.CE_FinDeValidité})`;
	return { 'LibelléTarif': titre };
}

