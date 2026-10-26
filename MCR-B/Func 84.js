console.log('Function 84', context);

const nbAccompagnateurs = docData.CC_NbAccompagnateur;

return nbAccompagnateurs >= 1
  ? { NomsDesAccompagnateurs: true }
  : { NomsDesAccompagnateurs: null };
