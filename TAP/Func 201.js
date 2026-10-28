const mapping = [
    { from: 'Domicile_Adresse', to: 'CollectionClientsTA|6|AdresseDep' },
    { from: 'Organisme_client', to: 'CollectionClientsTA|5|PrixOrganisme' },
    { from: 'ClientID', to: 'CollectionClientsTA|9|NoClient' }
];
const filters = [
    { key: 'STATUS', operator: 'EQUALS', value: 'ACTIF', type: 'TEXT' }
];
const collection = docData['CollectionClientsTA'];     
const currentRow = collection[indexItemChange];    
const searchField = 'CollectionClientsTA|1|NomClient';             
const searchValue = currentRow[searchField];    
if (searchValue) {
    api({ local: true })
        .post(
            `suggestion?fieldID=${'60241D18-F54C-4E87-A635-63E1889F99A5'}&fieldValue=${searchValue}`, { filters })
        .then(res => {
            if (res?.data?.suggestions?.length > 0) {
                callback({
                    suggestions: {
                        [searchField]: res.data?.suggestions.map(s => ({
                            title: s?.value, fields: s?.autoFill?.filter(a => mapping.map(m => m.from).includes(a.key)).map(a => ({
                                ...a,
                                value: a.value || '',
                                key: mapping.find(m => m.from === a.key).to,
                            }))
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