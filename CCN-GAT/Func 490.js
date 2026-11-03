const mapping = [
    {
        from: 'StatutInventaire', to: '3L_Statut_Ch2'
    },
    {
        from: 'NoUniqueInventaire', to: '3L_NumCh1'
    },
    {
        from: 'Description_Autocomplete', to: '3L_Description_Ch2'
    },
    {
        from: 'IDAideTechnique', to: '3L_NomCh2'
    }
]; const filters = [
    {
        key: 'StatutInventaire', operator: 'IN', value: 'DISPONIBLE', type: 'SELECT'
    },
    {
        key:'STATUS',operator:'EQUALS',value:'ACTIF',type:'TEXT'
    }
]; if (docData['3L_Description_Ch2'
]) {
    api({
        local: true
    }).post(`suggestion?fieldID=${'af269bee-019f-445d-8ae1-e9b3549a0a65'
        }&fieldValue=${docData['3L_Description_Ch2'
        ]
        }`,
        {
            filters
        }).then(res => res?.data?.suggestions?.length > 0 && callback({
            suggestions: {
                '3L_Description_Ch2': res.data?.suggestions.map(s => ({
                    title: s?.value, fields: s?.autoFill?.filter(a => mapping.map(m => m.from).includes(a.key)).map(a => ({
                        ...a, value: a.value || '', key: mapping.find(m => m.from === a.key).to,
                    }))
                }))
            }
        }));
} else {
    callback([]);
};