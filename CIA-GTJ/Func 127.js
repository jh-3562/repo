console.log('Function 127', context);

const aller = String(docData?.Demande_TrajetAller ?? '');
const retour = String(docData?.Demande_TrajetRetour ?? '');
const type = docData?.Transport_TypeTransport;

let distanceTotale = '';

switch (type) {
  case 'Aller':
    distanceTotale = aller;
    break;

  case 'Retour':
    distanceTotale = retour;
    break;

  case 'Aller/Retour':
    if (aller && retour) {
      distanceTotale = `${aller} | ${retour}`;
    } else {
      distanceTotale = aller || retour;
    }
    break;

  default:
    distanceTotale = '';
}

return {
  Demande_DistanceTotale: distanceTotale,
};
