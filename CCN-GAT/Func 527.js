const mapping = [
    {
        from: 'Description_Autocomplete', to: '9L_descriptionAideTechnique'
    },
    {
        from: 'IDAideTechnique', to: '9L_Name'
    }
]; const filters = {key:'STATUS',operator:'EQUALS',value:'Actif',type:'TEXT'}]; if (docData['9L_descriptionAideTechnique'
]) {
    api({
        local: true
    }).post(`suggestion?fieldID=${'be855355-23a4-4238-9cb5-a4412436622f'
        }&fieldValue=${docData['9L_descriptionAideTechnique'
        ]
        }`,
        {
            filters
        }).then(res => res?.data?.suggestions?.length > 0 && callback({
            suggestions: {
                '9L_descriptionAideTechnique': res.data?.suggestions.map(s => ({
                    title: s?.value, fields: s?.autoFill?.filter(a => mapping.map(m => m.from).includes(a.key)).map(a => ({
                        ...a, value: a.value || '', key: mapping.find(m => m.from === a.key).to,
                    }))
                }))
            }
        }));
} else {
    callback([]);
};