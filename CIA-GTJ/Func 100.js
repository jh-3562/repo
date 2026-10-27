console.log('Fonction 100', context);

let unite = null;

if (docData.Taux_TypeDeTaux === 'Horaire') {
  unite = '$ / h';
} else if (docData.Taux_TypeDeTaux === 'Au kilomètre') {
  unite = '$ / Km';
} else if (docData.Taux_TypeDeTaux === 'Repas') {
  unite = '$';
}

return {
  Taux_Montant_Unite: unite,
};
