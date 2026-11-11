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

        // Gabarit Tournée : la tournée est aussi dans la grille des cartes
        const TOUR_LAYOUT_ID = '94e653b0-9a07-4be6-ad9b-6efaa44d9982';

        const TRIP_COLORS = { 'ALLER': '#449FDC', 'RETOUR': '#E7A438', 'ALLER/RETOUR': '#7A75CF' }; const TRIP_BACKGROUNDS = { 'ALLER': '#cfe2f3', 'RETOUR': '#fce5cd', 'ALLER/RETOUR': '#d9d2e9' };

        const getTripType = transport => { if (transport.TypeTransport) return transport.TypeTransport; const groupType = transport['CollectionClientsTA|4|TypeTransportTA']; if (Array.isArray(groupType)) return groupType[0] || ''; return String(groupType || '').split('|')[0]; };

        const getTransportRows = () => {
            if (Array.isArray(window.transportsData) && window.transportsData.length) {
                return window.transportsData;
            }

            // Transports de la grille des cartes (rechargée à chaque rafraîchissement), sans la tournée
            const cardRows = (store.moduleStore.tableDatas?.Tournee_section_cards?.rows || [])
                .filter(row => row.formLayoutId !== TOUR_LAYOUT_ID && row.data?.FORMLAYOUTNAME !== 'Tournée');
            if (cardRows.length) return cardRows;

            return store.moduleStore.tableDatas?.GridTourneeTransportations?.rows || [];
        };

        const getPosition = value => {
            if (value === undefined || value === null || value === '') return null;
            const position = Number(value);
            return Number.isFinite(position) ? position : null;
        };

        const isGroupTransport = transport => transport.FORMLAYOUTID === 'de3bc87f-64fd-409b-a7bb-fcd9a505650c';

        const getClientName = transport => transport[TRANSPORT_KEYS.CLIENT_NAME]
            || transport[TRANSPORT_KEYS.CLIENT_NAME_FALLBACK]
            || (isGroupTransport(transport) ? transport.DescriptionTA || 'Transport de groupe' : 'Client inconnu');

        const buildStopOccurrences = transport => {
            const occurrences = [
                {
                    position: transport[TRANSPORT_KEYS.START],
                    positionKey: TRANSPORT_KEYS.START,
                    type: 'Montée',
                    address: transport.Etablissement_Adresse || transport.Visiteurs_adresse,
                },
                {
                    position: transport[TRANSPORT_KEYS.END],
                    positionKey: TRANSPORT_KEYS.END,
                    type: 'Descente',
                    address: transport.EtablissementDest_Adresse || transport.Stop_Destination,
                },
                {
                    position: transport[TRANSPORT_KEYS.RETURN_END],
                    positionKey: TRANSPORT_KEYS.RETURN_END,
                    type: 'Descente R.',
                    address: transport.EtablissementDest_Adresse || transport.Stop_Destination,
                },
                {
                    position: transport[TRANSPORT_KEYS.RETURN_START],
                    positionKey: TRANSPORT_KEYS.RETURN_START,
                    type: 'Montée R.',
                    address: transport.Etablissement_Adresse || transport.Visiteurs_adresse,
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
                    address: transport[`StopoverLocations|100|Address|${index + 1}`] || transport.AdresseDestination2,
                    client: transport[`StopoverLocations|50|NomClient|${index + 1}`],
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
                        Stop_Summary: `#${occurrence.position} • ${occurrence.type} • ${getTripType(transport)}`,
                        Stop_Destination: occurrence.address || '',
                        Stop_ClientLabel: (occurrence.client || !isGroupTransport(transport)) ? 'Client : ' : 'Groupe : ',
                        Stop_Clients: occurrence.client || clientName,
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

        const HOME_TYPE = 'Retour au domicile';
        const HOME_BORDER_COLOR = '#408B30';
        const HOME_BACKGROUND_COLOR = '#d9ead3';

        const cleanText = value => String(value || '').split(' ').filter(Boolean).join(' ');

        const getTourId = row => row.documentID || row.rowID;

        // La tournée est dans la grille des cartes (mêmes chauffeur et date que ses transports)
        const getTourRow = () => {
            const rows = store.moduleStore.tableDatas?.Tournee_section_cards?.rows || [];
            const tourRows = rows.filter(row => row.formLayoutId === TOUR_LAYOUT_ID || row.data?.FORMLAYOUTNAME === 'Tournée');
            return tourRows.find(row => window.location.href.includes(getTourId(row))) || tourRows[0];
        };

        const getHomePositions = tourRow => {
            const savedAfterDrag = window.tourHomePositions?.[getTourId(tourRow)];
            const value = savedAfterDrag !== undefined ? savedAfterDrag : tourRow.data?.PositionDomicileChauffeur;
            const values = Array.isArray(value) ? value : String(value || '').split('|');
            return values.map(getPosition).filter(position => position !== null && position > 0);
        };

        const buildHomeCards = () => {
            const tourRow = getTourRow();
            if (!tourRow) return [];
            const tour = tourRow.data || {};
            return getHomePositions(tourRow).map((position, index) => ({
                ...tourRow,
                key: `home-${getTourId(tourRow)}-${index}`,
                rowID: undefined,
                documentID: undefined,
                borderColor: HOME_BORDER_COLOR,
                backgroundColor: HOME_BACKGROUND_COLOR,
                data: {
                    Stop_Position: String(position),
                    Stop_Type: HOME_TYPE,
                    Stop_Summary: `#${position} • Retour au domicile du chauffeur`,
                    Stop_ClientLabel: 'Chauffeur : ',
                    Stop_Clients: cleanText(tour['Contrainte|1|Chauffeur']),
                    Stop_Destination: tour.Chauffeur_Adresse || '',
                    Transport_RowID: getTourId(tourRow),
                    Transport_OccurrenceKey: `home-${index}`,
                    Tour_Status: tourRow.status,
                    Tour_FormLayoutId: tourRow.formLayoutId || TOUR_LAYOUT_ID,
                },
            }));
        };

        try {
            return [...buildTransportCards(getTransportRows()), ...buildHomeCards()]
                .sort((first, second) => Number(first.data.Stop_Position) - Number(second.data.Stop_Position));
        } catch (error) {
            console.log('Erreur', 'Une erreur est survenue : ' + error.message);
            return [];
        }