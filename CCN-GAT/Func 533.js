const mapping = [
    {
        from: 'Description_Autocomplete', to: '10L_descriptionAideTechnique'
    },
    {
        from: 'IDAideTechnique', to: '10L_Name'
    }
]; const filters = []; if (docData['10L_descriptionAideTechnique'
]) {
    api({
        local: true
    }).post(`suggestion?fieldID=${'be855355-23a4-4238-9cb5-a4412436622f'
        }&fieldValue=${docData['10L_descriptionAideTechnique'
        ]
        }`,
        {
            filters
        }).then(res => res?.data?.suggestions?.length > 0 && callback({
            suggestions: {
                '10L_descriptionAideTechnique': res.data?.suggestions.map(s => ({
                    title: s?.value, fields: s?.autoFill?.filter(a => mapping.map(m => m.from).includes(a.key)).map(a => ({
                        ...a, value: a.value || '', key: mapping.find(m => m.from === a.key).to,
                    }))
                }))
            }
        }));
} else {
    callback([]);
};

