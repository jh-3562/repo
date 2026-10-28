const mapping = [
    { from: 'AdresseInstitution', to: 'AdresseDestination2' }
];
const filters = [
];
if (docData['Nomdulieu22']) {
    api({ local: true })
        .get(
            `suggestion?fieldID=${'567f8bcd-f061-42c5-972d-deb9402bbaf3'}&fieldValue=${docData['Nomdulieu22']
            }`)
        .then(res => res?.data?.suggestions?.length > 0 && callback({
            suggestions: {
                'Nomdulieu22': res.data?.suggestions.filter(s => filters.length < 1 || ((s?.autofill?.find(a => filters.reduce((acc, currFil) => (acc && a[currFil.key] === currFil.value), true)) || undefined) !== undefined)
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
