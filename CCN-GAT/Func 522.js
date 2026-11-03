const mapping = [
    { from: 'Description_Autocomplete', to: '8L_descriptionAideTechnique_Ch2'
    },
    {from:'IDAideTechnique',to:'8L_NomCh2'
    }
];  const filters = [];  if (docData['8L_descriptionAideTechnique_Ch2'
]) {      api({ local: true
    })          .post(              `suggestion?fieldID=${'be855355-23a4-4238-9cb5-a4412436622f'
    }&fieldValue=${docData['8L_descriptionAideTechnique_Ch2'
        ]
    }`              ,
    { filters
    })          .then(res => res?.data?.suggestions?.length > 0 && callback({              suggestions: {                  '8L_descriptionAideTechnique_Ch2': res.data?.suggestions.map(s => ({                      title: s?.value,                      fields: s?.autoFill?.filter(a => mapping.map(m => m.from).includes(a.key)).map(a => ({                          ...a,                          value: a.value || '',                          key: mapping.find(m => m.from === a.key).to,
                }))
            }))
        }
    })          );
} else {      callback([]);
};