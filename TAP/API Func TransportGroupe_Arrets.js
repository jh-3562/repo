console.log('Arrêts du transport de groupe', context);

const GROUP_GRID_KEY = 'TransportGroupe_Arrets';
const COLLECTION_KEY = 'StopoverLocations';
const COLORS = {
    start: { border: '#9A9999', background: '#eeeeee' },
    stopover: { border: '#449FDC', background: '#cfe2f3' },
    end: { border: '#9A9999', background: '#eeeeee' },
    returnStopover: { border: '#E7A438', background: '#fce5cd' },
    returnEnd: { border: '#9A9999', background: '#eeeeee' },
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

const isRoundTripGroup = data => data['CollectionClientsTA|4|TypeTransportTA'] === 'ALLER/RETOUR';

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
            position: toNumber(readStopoverField(data, rowObjects, '4000|StopPos', index)) ?? toNumber(positions[index - 1]) ?? index,
            returnRank: toNumber(readStopoverField(data, rowObjects, '120|PositionRetour', index)),
            client: String(readStopoverField(data, rowObjects, '50|NomClient', index) || '').split(' ').filter(Boolean).join(' '),
            address: readStopoverField(data, rowObjects, '100|Address', index) || '',
            absent: String(readStopoverField(data, rowObjects, '10|Absent', index)) === 'true',
        }))
        .sort((first, second) => first.position - second.position);
};

// Ordre du retour : « P. Dest. » ; les destinations sans P. Dest. (ajoutées depuis) passent en premier, dans l'ordre inverse de l'aller
const isRanked = rank => Number.isInteger(rank) && rank >= 1;
const getReturnOrder = stopovers => {
    const ranked = stopovers.filter(stopover => isRanked(stopover.returnRank));
    if (new Set(ranked.map(stopover => stopover.returnRank)).size !== ranked.length) return stopovers.slice().reverse();
    const added = stopovers.filter(stopover => !isRanked(stopover.returnRank)).reverse();
    return [...added, ...ranked.sort((first, second) => first.returnRank - second.returnRank)];
};

const buildCard = (row, type, order, summary, clientLabel, client, address, stopoverIndex, extraData = {}) => ({
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
        ...extraData,
    },
});

const absentText = stopover => (stopover.absent ? ' (absent)' : '');

// Aller : départ, destinations, destination ; aller/retour : puis les mêmes destinations dans l'ordre du retour et le retour au départ
const buildGroupCards = row => {
    if (!row) return [];
    const data = row.data || {};
    const stopovers = getStopovers(data);
    const cards = [
        buildCard(row, 'start', 0, 'Départ', '', 'Point de départ du groupe', data.Visiteurs_adresse || '', null),
        ...stopovers.map((stopover, order) => buildCard(
            row, 'stopover', order + 1,
            `#${order + 1} • Destination intermédiaire${absentText(stopover)}`,
            'Client : ', stopover.client, stopover.address, stopover.index
        )),
        buildCard(row, 'end', stopovers.length + 1, 'Destination', '', 'Point d’arrivée du groupe', data.Stop_Destination || '', null),
    ];
    if (!isRoundTripGroup(data)) return cards;
    const returnOrder = getReturnOrder(stopovers);
    return [
        ...cards,
        ...returnOrder.map((stopover, order) => buildCard(
            row, 'returnStopover', stopovers.length + 2 + order,
            `#${stopovers.length + order + 1} • Retour - destination intermédiaire${absentText(stopover)}`,
            'Client : ', stopover.client, stopover.address, stopover.index,
            { Return_Rank: String(order + 1) }
        )),
        buildCard(row, 'returnEnd', 2 * stopovers.length + 2, 'Retour au départ', '', 'Fin du retour du groupe', data.Visiteurs_adresse || '', null),
    ];
};

try {
    return buildGroupCards(getGroupRow());
} catch (error) {
    console.log('Erreur', 'Une erreur est survenue : ' + error.message);
    return [];
}