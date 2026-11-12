console.log('DnD transport de groupe', context);

const COLLECTION_KEY = 'StopoverLocations';
const STOP_POSITION_FIELD = '4000|StopPos';
const PICKUP_ORDER_FIELD = '110|PositionAller';
const DROPOFF_ORDER_FIELD = '120|PositionRetour';

const showErrorBanner = errorMessage => {
    let banner = document.getElementById('errorBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'errorBanner';
        document.body.appendChild(banner);
    }
    banner.style = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); min-width: 300px; min-height: 50px; background-color: white; color: black; display: flex; justify-content: center; align-items: center; z-index: 10000; border-radius: 5px; padding: 0 20px; box-shadow: 0 0 10px rgba(0,0,0,0.5); font-family: var(--chakra-fonts-body);';
    banner.innerHTML = `<div style='margin-right: 10px; color: red;'>&#x26A0;</div><div>${errorMessage}</div>`;
    setTimeout(() => { banner.style.display = 'none'; }, 5000);
};

// Nouvel ordre de passage = ordre des cartes « destination intermédiaire » après le dépôt
const getNewStopoverOrder = () => dnd.drop.items
    .map(item => item.row?.data || {})
    .filter(data => data.Stop_Type === 'stopover');

const getGroupDocument = async groupId => {
    const response = await api({ local: true }).post('document/id', { ids: [groupId] });
    if (response.status !== 200) throw new Error('Problem during document/id api call');
    const groupDocument = response.data.documents?.[0];
    if (!groupDocument) throw new Error('Transport de groupe introuvable');
    return groupDocument;
};

// Ordre inchangé : les destinations déposées gardent des numéros croissants
const isDisplayedOrderUnchanged = stopovers => stopovers
    .every((stopover, offset) => offset === 0 || Number(stopover.Stop_Position) > Number(stopovers[offset - 1].Stop_Position));

const readPosition = (value, fallback) => {
    const position = value === undefined || value === null || value === '' ? NaN : Number(value);
    return Number.isFinite(position) ? position : fallback;
};

// Lignes du groupe dans l'ordre des cartes (même tri que leur affichage)
const getDisplayedRowOrder = data => {
    const latitudes = String(data.LatitudeStopsCollec || '').split('|').filter(Boolean);
    const count = Array.isArray(data[COLLECTION_KEY]) ? data[COLLECTION_KEY].length : (Number(data[COLLECTION_KEY]) || latitudes.length);
    const positions = String(data.StopPosStopsCollec || '').split('|');
    return Array.from({ length: count }, (_, offset) => offset + 1)
        .map(index => ({ index, position: readPosition(positions[index - 1], index) }))
        .sort((first, second) => first.position - second.position)
        .map(row => row.index);
};

const isCompleteOrder = (order, rowCount) => rowCount > 0 && order.length === rowCount && new Set(order).size === rowCount
    && order.every(index => Number.isInteger(index) && index >= 1 && index <= rowCount);

// Avec une recherche active, seules les destinations visibles changent d'ordre, entre les places qu'elles occupaient
const buildFullOrder = (data, visibleStopovers) => {
    const newOrder = getDisplayedRowOrder(data);
    const rowCount = newOrder.length;
    const visibleOrder = visibleStopovers.map(stopover => Number(stopover.Stopover_Index));
    visibleStopovers
        .map(stopover => Number(stopover.Stop_Position))
        .sort((first, second) => first - second)
        .forEach((slot, offset) => { newOrder[slot - 1] = visibleOrder[offset]; });
    if (!isCompleteOrder(newOrder, rowCount)) throw new Error('Ordre de passage incomplet : ' + newOrder.join(','));
    return newOrder;
};

const reorderPipeList = (value, newOrder) => {
    const values = String(value || '').split('|');
    return newOrder.map(oldIndex => values[oldIndex - 1] ?? '').join('|');
};

// Groupe placé dans une tournée : ses numéros de tournée, dans le nouvel ordre ; sinon 1, 2, 3…
const getSortedPositions = (data, count) => {
    const ordinalPositions = Array.from({ length: count }, (_, index) => String(index + 1));
    const isInTour = Number(data.startStopNumber) > 0;
    const positions = String(data.StopPosStopsCollec || '').split('|').map(Number).filter(position => Number.isFinite(position) && position > 0);
    if (!isInTour || positions.length !== count) return ordinalPositions;
    return positions.sort((a, b) => a - b).map(String);
};

const buildReorderedData = (data, newOrder) => {
    const oldToNew = {};
    newOrder.forEach((oldIndex, offset) => { oldToNew[oldIndex] = offset + 1; });
    const newData = {};
    Object.keys(data).forEach(key => {
        const parts = key.split('|');
        if (parts.length !== 4 || parts[0] !== COLLECTION_KEY) return;
        const newIndex = oldToNew[Number(parts[3])];
        if (!newIndex) return;
        newData[`${parts[0]}|${parts[1]}|${parts[2]}|${newIndex}`] = data[key];
    });
    if (Array.isArray(data[COLLECTION_KEY])) {
        newData[COLLECTION_KEY] = newOrder.map(oldIndex => data[COLLECTION_KEY][oldIndex - 1]);
    }
    const positions = getSortedPositions(data, newOrder.length);
    // P. Dép. = ordre de passage à l'aller ; P. Dest. = ordre inverse au retour, seulement pour un aller/retour
    const isRoundTrip = data['CollectionClientsTA|4|TypeTransportTA'] === 'ALLER/RETOUR';
    positions.forEach((position, offset) => {
        newData[`${COLLECTION_KEY}|${STOP_POSITION_FIELD}|${offset + 1}`] = position;
        newData[`${COLLECTION_KEY}|${PICKUP_ORDER_FIELD}|${offset + 1}`] = String(offset + 1);
        newData[`${COLLECTION_KEY}|${DROPOFF_ORDER_FIELD}|${offset + 1}`] = isRoundTrip ? String(newOrder.length - offset) : '';
    });
    // Listes reconstruites depuis les lignes (toujours à jour) ; l'ancienne liste ne sert qu'en secours
    const oldLatitudes = reorderPipeList(data.LatitudeStopsCollec, newOrder).split('|');
    const oldLongitudes = reorderPipeList(data.LongitudeStopsCollec, newOrder).split('|');
    newData.LatitudeStopsCollec = newOrder.map((_, offset) => newData[`${COLLECTION_KEY}|3000|Latitude|${offset + 1}`] ?? oldLatitudes[offset] ?? '').join('|');
    newData.LongitudeStopsCollec = newOrder.map((_, offset) => newData[`${COLLECTION_KEY}|2000|Longitude|${offset + 1}`] ?? oldLongitudes[offset] ?? '').join('|');
    newData.StopPosStopsCollec = positions.join('|');
    return newData;
};

// Dans le formulaire ouvert, la collection est un tableau de lignes
const buildFormCollection = (newData, count) => Array.from({ length: count }, (_, offset) => {
    const suffix = `|${offset + 1}`;
    const row = {};
    Object.keys(newData)
        .filter(key => key.startsWith(`${COLLECTION_KEY}|`) && key.endsWith(suffix) && key.split('|').length === 4)
        .forEach(key => { row[key.slice(0, -suffix.length)] = newData[key]; });
    return row;
});

const saveGroup = async (groupDocument, newData) => {
    const response = await api({ local: true }).put('document', {
        document: {
            documentID: groupDocument.documentID,
            data: JSON.stringify(newData),
            status: groupDocument.status,
            active: true,
            template: groupDocument.template
        },
        // Sans notification : évite l'alerte « modifié par un autre utilisateur » sur le groupe ouvert
        preventNotify: 'DOCUMENT'
    });
    if (!response || response.status < 200 || response.status >= 300) throw new Error('document : statut ' + response?.status);
};

// Le départ et la destination ne se verrouillent pas : un enregistrement vide recharge les cartes dans l'ordre enregistré
const reloadSavedOrder = async groupId => {
    const groupDocument = await getGroupDocument(groupId);
    await saveGroup(groupDocument, {});
};

const main = async () => {
    try {
        const groupId = dnd.drop.items.map(item => item.row?.data?.Group_RowID).find(Boolean);
        if (!groupId) return;
        const newStopoverOrder = getNewStopoverOrder();
        if (!newStopoverOrder.length || isDisplayedOrderUnchanged(newStopoverOrder)) {
            await reloadSavedOrder(groupId);
            return;
        }

        const groupDocument = await getGroupDocument(groupId);
        const groupData = JSON.parse(groupDocument.data);
        const newOrder = buildFullOrder(groupData, newStopoverOrder);
        const newData = buildReorderedData(groupData, newOrder);
        await saveGroup(groupDocument, newData);
        injectDocData({
            fillData: {
                [COLLECTION_KEY]: buildFormCollection(newData, newOrder.length),
                LatitudeStopsCollec: newData.LatitudeStopsCollec,
                LongitudeStopsCollec: newData.LongitudeStopsCollec,
                StopPosStopsCollec: newData.StopPosStopsCollec
            }
        });
    } catch (error) {
        console.error('Erreur DnD transport de groupe :', error);
        showErrorBanner('Le nouvel ordre de passage n’a pas pu être enregistré. Réessayez ou contactez le soutien.');
    }
};

main();