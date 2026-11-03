const mapping = [
    { from: 'NoUniqueInventaire', to: 'Recuperation|1|NoInventaire' }
];
const filters = [];
const collection = docData['Recuperation'];
const currentRow = collection[indexItemChange];
const searchField = 'Recuperation|2|Description';
const searchValue = currentRow[searchField];
if (searchValue) {
    api({ local: true })
        .post(
            `suggestion?fieldID=${'af269bee-019f-445d-8ae1-e9b3549a0a65'}&fieldValue=${searchValue}`, { filters })
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