console.log('Arrêts du transport de groupe', context);

const GROUP_GRID_KEY = 'TransportGroupe_Arrets';
const COLLECTION_KEY = 'StopoverLocations';
const COLORS = {
    start: { border: '#9A9999', background: '#eeeeee' },
    stopover: { border: '#449FDC', background: '#cfe2f3' },
    end: { border: '#9A9999', background: '#eeeeee' },
};

const getRowId = row => row.rowID || row.key || row.documentID;

// La grille contient les groupes du même jour : on garde celui qui est ouvert (son ID est dans l'adresse de la page)
const getGroupRow = () => {
    const gridRows = store.moduleStore.tableDatas?.[GROUP_GRID_KEY]?.rows || [];
    const rows = gridRows.length ? gridRows : (store.pageContentStore?.maskRows || []);
    return rows.find(row => getRowId(row) && window.location.href.includes(getRowId(row)));
};

const toNumber = value => {
    if (value === undefined || value === null || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
};

const parseCollection = value => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string' && value.trim().startsWith('[')) {
        try { return JSON.parse(value); } catch (error) { return []; }
    }
    return null;
};

// La collection peut arriver en tableau de lignes ou en clés « Collection|n|Champ|ligne »
const readStopoverField = (data, rowObjects, fieldKey, index) => {
    const fullKey = `${COLLECTION_KEY}|${fieldKey}`;
    if (rowObjects) return rowObjects[index - 1]?.[fullKey];
    if (data[`${fullKey}|${index}`] !== undefined) return data[`${fullKey}|${index}`];
    const listed = data[fullKey];
    return Array.isArray(listed) ? listed[index - 1] : undefined;
};

const getStopovers = data => {
    const rowObjects = parseCollection(data[COLLECTION_KEY]);
    const latitudes = String(data.LatitudeStopsCollec || '').split('|').filter(Boolean);
    const positions = String(data.StopPosStopsCollec || '').split('|');
    const count = rowObjects ? rowObjects.length : (toNumber(data[COLLECTION_KEY]) || latitudes.length);
    return Array.from({ length: count }, (_, offset) => offset + 1)
        .map(index => ({
            index,
            position: toNumber(positions[index - 1]) ?? index,
            client: String(readStopoverField(data, rowObjects, '50|NomClient', index) || '').split(' ').filter(Boolean).join(' '),
            address: readStopoverField(data, rowObjects, '100|Address', index) || '',
            absent: String(readStopoverField(data, rowObjects, '10|Absent', index)) === 'true',
        }))
        .sort((first, second) => first.position - second.position);
};

const buildCard = (row, type, order, summary, clientLabel, client, address, stopoverIndex) => ({
    ...row,
    key: `${row.key || row.rowID}-${type}-${order}`,
    rowID: undefined,
    documentID: undefined,
    borderColor: COLORS[type].border,
    backgroundColor: COLORS[type].background,
    data: {
        Stop_Position: String(order),
        Stop_Type: type,
        Stop_Summary: summary,
        Stop_ClientLabel: clientLabel,
        Stop_Clients: client,
        Stop_Address: address,
        Group_RowID: getRowId(row),
        Stopover_Index: stopoverIndex,
    },
});

const buildGroupCards = row => {
    if (!row) return [];
    const data = row.data || {};
    const stopovers = getStopovers(data);
    return [
        buildCard(row, 'start', 0, 'Départ', '', 'Point de départ du groupe', data.Visiteurs_adresse || '', null),
        ...stopovers.map((stopover, order) => buildCard(
            row,
            'stopover',
            order + 1,
            `#${order + 1} • Destination intermédiaire${stopover.absent ? ' (absent)' : ''}`,
            'Client : ',
            stopover.client,
            stopover.address,
            stopover.index
        )),
        buildCard(row, 'end', stopovers.length + 1, 'Destination', '', 'Point d’arrivée du groupe', data.Stop_Destination || '', null),
    ];
};

try {
    return buildGroupCards(getGroupRow());
} catch (error) {
    console.log('Erreur', 'Une erreur est survenue : ' + error.message);
    return [];
}