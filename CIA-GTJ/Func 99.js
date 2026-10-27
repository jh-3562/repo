console.log('Fonction 99', context);

const typeTaux = docData.Taux_TypeDeTaux === 'Horaire';
const typeKilometre = docData.Taux_TypeDeTaux === 'Au kilomètre';
const typeRepas = docData.Taux_TypeDeTaux === 'Repas';

const aucunChoix = !typeTaux && !typeKilometre;

return {
  Taux_CatégorieDuTransporteur: typeTaux || aucunChoix ? 'true' : null,
  Taux_TypeDeSurface: typeKilometre ? 'true' : null,
  Taux_TypeDeRepas: typeRepas ? true : null,
};
