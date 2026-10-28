const mapping = [
    {from :'Organisme_client', to : 'CollectionClientsTA|5|PrixOrganisme'}
];
const filters = [
];
if (docData['CollectionClientsTA|1|NomClient']) {
    api({ local: true })
        .get(
            `suggestion?fieldID=${'60241d18-f54c-4e87-a635-63e1889f99a5'}&fieldValue=${docData['CollectionClientsTA|1|NomClient']
            }`)
        .then(res => res?.data?.suggestions?.length > 0 && callback({
            suggestions: {
                'CollectionClientsTA|1|NomClient': res.data?.suggestions.filter(s => filters.length < 1 || ((s?.autofill?.find(a => filters.reduce((acc, currFil) => (acc && a[currFil.key] === currFil.value), true)) || undefined) !== undefined)
                ).map(s => ({
                    title: s?.value,
                    fields: s?.autoFill?.filter(a => mapping.map(m => m.from).includes(a.key)).map(a => ({
                        ...a,
                        value: a.value || '',
                        key: mapping.find(m => m.from === a.key).to,
                    }))
                }))
            }
        })
        );
} else {
    callback([]);
};
