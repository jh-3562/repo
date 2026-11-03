const filters = [];
const collectionKey = 'Dons';
const searchField = `${collectionKey}|1|Description`;

const collection = docData[collectionKey] || [];
const currentRow = collection[indexItemChange] || {};

const searchValue = currentRow[searchField];

if (searchValue) {
  api({ local: true })
    .post(
      `suggestion?fieldID=${'af269bee-019f-445d-8ae1-e9b3549a0a65'}&fieldValue=${encodeURIComponent(searchValue)}`,
      { filters }
    )
    .then(res => {
      const suggestions = res?.data?.suggestions || [];
      if (!suggestions.length) return;

      callback({
        suggestions: {
          [searchField]: suggestions.map(s => ({
            title: s?.value || '',
            // Pas de récupération / remplissage du NoInventaire ici
            fields: []
          }))
        }
      });
    });
} else {
  callback([]);
}
