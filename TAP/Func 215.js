if (docData['Dates_Multidates']) {
  let a=docData['Dates_Multidates'].split('|');
  for (item in a) {
      a[item]=Date.parse(new Date(a[item]));
  }
  console.log(a,new Date(Math.max(...a)).toISOString().substring(0,10))
  return {
      'Dates_FinRec':new Date(Math.max(...a)).toISOString().substring(0,10)
  }
}
else {undefined}