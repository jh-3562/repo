console.log('Carte du transport de groupe', context);

const GROUP_GRID_KEY = 'TransportGroupe_Carte';

const getRowId = row => row.rowID || row.key || row.documentID;

// La grille contient les groupes du même jour : on garde celui qui est ouvert (son ID est dans l'adresse de la page)
const getGroupRows = () => {
    const gridRows = store.moduleStore.tableDatas?.[GROUP_GRID_KEY]?.rows || [];
    const rows = gridRows.length ? gridRows : (store.pageContentStore?.maskRows || []);
    return rows.filter(row => getRowId(row) && window.location.href.includes(getRowId(row)));
};

const toNumber = value => {
    if (value === undefined || value === null || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
};

const hasCoordinates = (latitude, longitude) => toNumber(latitude) !== null && toNumber(longitude) !== null;

const buildMarker = (row, latitude, longitude, label, suffix) => ({
    ...row,
    key: `${row.key || row.rowID}-${suffix}`,
    data: {
        ...row.data,
        Latitude: String(latitude),
        Longitude: String(longitude),
        displayOnMaskingGrids: label,
    },
});

// Arrêts intermédiaires dans l'ordre de passage, lus dans les lignes (les listes ne servent qu'en secours)
const getStopoverPoints = data => {
    const count = toNumber(data.StopoverLocations) || 0;
    const latitudes = String(data.LatitudeStopsCollec || '').split('|');
    const longitudes = String(data.LongitudeStopsCollec || '').split('|');
    const positions = String(data.StopPosStopsCollec || '').split('|');
    const fromRows = Array.from({ length: count }, (_, index) => ({
        latitude: data[`StopoverLocations|3000|Latitude|${index + 1}`],
        longitude: data[`StopoverLocations|2000|Longitude|${index + 1}`],
        position: toNumber(data[`StopoverLocations|4000|StopPos|${index + 1}`]) ?? toNumber(positions[index]) ?? index + 1,
    }));
    const useRows = fromRows.some(point => hasCoordinates(point.latitude, point.longitude));
    const points = useRows ? fromRows : latitudes.slice(0, count).map((latitude, index) => ({
        latitude, longitude: longitudes[index], position: toNumber(positions[index]) ?? index + 1,
    }));
    return points
        .filter(point => hasCoordinates(point.latitude, point.longitude))
        .sort((first, second) => first.position - second.position);
};

// D = départ, 1, 2, 3… = destinations intermédiaires, A = arrivée
const buildGroupMarkers = row => {
    const data = row.data || {};
    const markers = [];
    if (hasCoordinates(data.startLatitude, data.startLongitude)) {
        markers.push(buildMarker(row, data.startLatitude, data.startLongitude, 'D', 'start'));
    }
    getStopoverPoints(data).forEach((point, order) => {
        markers.push(buildMarker(row, point.latitude, point.longitude, String(order + 1), `stop-${order}`));
    });
    if (hasCoordinates(data.endLatitude, data.endLongitude)) {
        markers.push(buildMarker(row, data.endLatitude, data.endLongitude, 'A', 'end'));
    }
    return markers;
};

try {
    return getGroupRows().flatMap(buildGroupMarkers);
} catch (error) {
    console.log('Erreur', 'Une erreur est survenue : ' + error.message);
    return [];
}
