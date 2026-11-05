// prepareData de la section CARDS Tournee_TableStops (ViewContent 4809945e-414f-4a99-b024-357418da451b)
console.log('transport cards', context);

const TRANSPORT_KEYS = {
    CLIENT_NAME: 'Contrainte|2|NomClient',
    CLIENT_NAME_FALLBACK: 'Transports|1|Client',
    TYPE: 'TypeTransport',
    START: 'startStopNumber',
    END: 'endStopNumber',
    RETURN_END: 'endStopNumberRetour',
    RETURN_START: 'startStopNumberRetour',
    STOPOVER: 'stopoverStopNumber',
    STOPOVERS: 'StopPosStopsCollec',
};

// Couleurs reprises de la table Style de TAP (bordure : 16, 15, 29 ; fond pâle : 106, 108, 101)
const TRIP_COLORS = { 'ALLER': '#449FDC', 'RETOUR': '#E7A438', 'ALLER/RETOUR': '#7A75CF' }; const TRIP_BACKGROUNDS = { 'ALLER': '#cfe2f3', 'RETOUR': '#fce5cd', 'ALLER/RETOUR': '#d9d2e9' };

// Un transport de groupe porte son type dans la collection des clients
const getTripType = transport => {
    if (transport.TypeTransport) return transport.TypeTransport;
    const groupType = transport['CollectionClientsTA|4|TypeTransportTA'];
    if (Array.isArray(groupType)) return groupType[0] || '';
    return String(groupType || '').split('|')[0];
};

const getTransportRows = () => {
    if (Array.isArray(window.transportsData) && window.transportsData.length) {
        return window.transportsData;
    }

    const tableRows = store.moduleStore.tableDatas
        ?.GridTourneeTransportations?.rows;
    if (tableRows?.length) return tableRows;

    const pageRows = store.pageContentStore?.maskRows;
    return pageRows?.length ? pageRows : [];
};

const getPosition = value => {
    if (value === undefined || value === null || value === '') return null;
    const position = Number(value);
    return Number.isFinite(position) ? position : null;
};

const getClientName = transport => transport[TRANSPORT_KEYS.CLIENT_NAME]
    || transport[TRANSPORT_KEYS.CLIENT_NAME_FALLBACK]
    || 'Client inconnu';

const buildStopOccurrences = transport => {
    const occurrences = [
        {
            position: transport[TRANSPORT_KEYS.START],
            positionKey: TRANSPORT_KEYS.START,
            type: 'Montée',
            address: transport.Etablissement_Adresse,
        },
        {
            position: transport[TRANSPORT_KEYS.END],
            positionKey: TRANSPORT_KEYS.END,
            type: 'Descente',
            address: transport.EtablissementDest_Adresse,
        },
        {
            position: transport[TRANSPORT_KEYS.RETURN_END],
            positionKey: TRANSPORT_KEYS.RETURN_END,
            type: 'Descente R.',
            address: transport.EtablissementDest_Adresse,
        },
        {
            position: transport[TRANSPORT_KEYS.RETURN_START],
            positionKey: TRANSPORT_KEYS.RETURN_START,
            type: 'Montée R.',
            address: transport.Etablissement_Adresse,
        },
        {
            position: transport[TRANSPORT_KEYS.STOPOVER],
            positionKey: TRANSPORT_KEYS.STOPOVER,
            type: 'Arrêt',
            address: transport.AdresseDestination2,
        },
    ];

    String(transport[TRANSPORT_KEYS.STOPOVERS] || '')
        .split('|')
        .filter(Boolean)
        .forEach((position, index) => occurrences.push({
            position,
            positionKey: `${TRANSPORT_KEYS.STOPOVERS}|${index}`,
            type: 'Arrêt',
            address: transport.AdresseDestination2,
        }));

    return occurrences
        .map((occurrence, occurrenceIndex) => ({
            ...occurrence,
            position: getPosition(occurrence.position),
            occurrenceIndex,
        }))
        .filter(occurrence => occurrence.position !== null);
};

const buildTransportCards = rows => rows
    .flatMap((row, transportIndex) => {
        const transport = row.data || {};
        const clientName = getClientName(transport);

        return buildStopOccurrences(transport).map(occurrence => ({
            ...row,
            key: `${row.key || row.rowID}-${occurrence.position}-${occurrence.occurrenceIndex}`,
            Transport_Key: row.key || row.rowID,
            rowID: undefined,
            documentID: undefined,
            borderColor: TRIP_COLORS[getTripType(transport)] || 'var(--chakra-colors-fw-accent)', backgroundColor: TRIP_BACKGROUNDS[getTripType(transport)],
            data: {
                ...transport,
                Stop_Position: String(occurrence.position),
                Stop_Type: occurrence.type,
                Stop_Summary: `#${occurrence.position} • ${occurrence.type} • ${transport.TypeTransport || ''}`,
                Stop_Destination: occurrence.address || '',
                Stop_Clients: clientName,
                Stop_Heure: transport.Stop_Heure
                    || transport.EtablissementDest_HeureRDV
                    || '',
                Transport_RowID: row.documentID || row.rowID,
                Transport_Index: transportIndex,
                Transport_PositionKey: occurrence.positionKey,
                Transport_OccurrenceKey: `${row.documentID || row.rowID}-${occurrence.positionKey}`,
            },
        }));
    })
    .sort((first, second) => Number(first.data.Stop_Position)
        - Number(second.data.Stop_Position));

try {
    return buildTransportCards(getTransportRows());
} catch (error) {
    console.log('Erreur', 'Une erreur est survenue : ' + error.message);
    return [];
}
