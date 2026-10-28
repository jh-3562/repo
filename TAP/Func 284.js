const mapping = [
  { from: 'ClientID', to: 'StopArret|5|ID' },
  { from: 'Deficience', to: 'StopArret|2|Deficience' },
  { from: 'Appareil_liste', to: 'StopArret|3|Appareil' },
  { from: 'Domicile_Adresse', to: 'StopArret|4|Adresse' }
];
const filters = [
// { key: 'StatutOperationnel', operator: 'EQUALS', value: 'Disponible', type: 'TEXT' },
];
const formidKeys = [
  { collection: "StopArret", key: "StopArret|6|FormID" },
];
const fieldID='60241d18-f54c-4e87-a635-63e1889f99a5'
const collection = docData['StopArret'];
const currentRow = collection[indexItemChange];   
const searchField = 'StopArret|1|Client';       
const searchValue = currentRow[searchField];   
const idField='StopArret|6|FormID'
const fetchFormidSelected = (docData, formidKeys) => {
  let formidSelected = [];
  formidKeys.forEach((e) => {
    if (docData[e.collection] && docData[e.collection].length > 0) {
      docData[e.collection].forEach((row) => {
        if (row[e.key]) {
          formidSelected.push(row[e.key]);
        }
      });
    }
  });
  return formidSelected;
};
const formidSelected = fetchFormidSelected(docData, formidKeys);
if (searchValue) {
  api({ local: true })
      .post(
          `suggestion?fieldID=${fieldID}&fieldValue=${searchValue}`, { filters })
      .then(res => {
          if (res?.data?.suggestions?.length > 0) {
              callback({
                  suggestions: {
                      [searchField]: res.data?.suggestions.filter((f)=>!formidSelected.includes(f.documentID) ).map(s => ({
                          title: s?.value, 
                          fields: (s?.autoFill?.filter(a => mapping.map(m => m.from).includes(a.key)).map(a => ({
                              ...a,
                              value: a.value || '',
                              key: mapping.find(m => m.from === a.key).to,
                          }))).concat([{name:'Form ID',key:idField,value:s.documentID}])
                      }))
                  }
              })
          }
          else { callback({ suggestions:{ [searchField]:[] }}) }
      })
}
else {
  callback({ suggestions:{ [searchField]:[] }});
}