const mapping = [
    { from: 'StatutInventaire', to: '8L_Statut' },
    { from: 'NoUniqueInventaire', to: '8L_NumFinal' },
    { from: 'Description_Autocomplete', to: '8L_Description' },
    { from: 'IDAideTechnique', to: '8L_Name' },
    { from: 'BIN', to: '8L_BIN' }
];
const filters = [
    { key: 'StatutInventaire', operator: 'IN', value: 'DISPONIBLE', type: 'SELECT' },
    { key: 'STATUS', operator: 'EQUALS', value: 'ACTIF', type: 'TEXT' }
];
if (docData['8L_Description']) {
    api({
        local: true
    }).post(`suggestion?fieldID=${'af269bee-019f-445d-8ae1-e9b3549a0a65'
        }&fieldValue=${docData['8L_Description']}`, { filters }).then(res => {
            if (res?.data?.suggestions?.length > 0) {
                callback({
                    suggestions: {
                        '8L_Description': res.data?.suggestions.map(s => ({
                            title: s?.value, fields: s?.autoFill?.filter(a => mapping.map(m => m.from).includes(a.key)).map(a => ({
                                ...a, value: a.value || '', key: mapping.find(m => m.from === a.key).to,
                            }))
                        }))
                    },
                    data: { '8L_StatutFinal': 'Attribué' }
                })
            }
            else { callback({ suggestions: { '8L_Description': [] } }) }
        });
} else {
    callback({ suggestions: { '8L_Description': [] } });
};