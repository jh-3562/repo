const mapping = [
    { from: 'Description_Autocomplete', to: 'Recuperation|2|Description' }
];
const filters = [];
const collection = docData['Recuperation'];
const currentRow = collection[indexItemChange];
const searchField = 'Recuperation|1|NoInventaire';
const searchValue = currentRow[searchField];
if (searchValue) {
    api({ local: true })
        .post(
            `suggestion?fieldID=${'e0f4c957-d51d-4a75-8dd6-18bf6256dbba'}&fieldValue=${searchValue}`, { filters })
        .then(res => res?.data?.suggestions?.length > 0 && callback({
            suggestions: {
                [searchField]: res.data?.suggestions.map(s => ({
                    title: s?.value,
                    fields: s?.autoFill?.filter(a => mapping.map(m => m.from).includes(a.key)).map(a => ({
                        ...a,
                        value: a.value || '',
                        key: mapping.find(m => m.from === a.key).to,
                    }))
                }))
            }
        })
    )
}
else {
    callback([]);
}