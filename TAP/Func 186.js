if (docData['Patient_DateNaissance'].length=10) {
    let aujourdhui = new Date();
    let anneeAujourdhui = aujourdhui.getFullYear();
    let moisAujourdhui = aujourdhui.getMonth() + 1;
    let jourAujourdhui = aujourdhui.getDate();
  
    let dateNaissanceTable = docData['Patient_DateNaissance'].split('-');
    let anneeNaissance = dateNaissanceTable[0];
    let moisNaissance = dateNaissanceTable[1];
    let jourNaissance = dateNaissanceTable[2];
  
    let age = anneeAujourdhui - anneeNaissance;
	let mois = moisAujourdhui - moisNaissance;
	let jour = jourAujourdhui - jourNaissance;
  
    if (mois < 0 || (mois === 0 && jour < 0)) {
      age -= 1;
    }
  
    return {'Age':age}
  }