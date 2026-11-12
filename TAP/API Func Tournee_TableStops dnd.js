            console.log('DnD', context);

            // ============================================================================
            // CONSTANTS
            // ============================================================================

            const TRANSPORT_KEYS = {
                STOP_POSITION_DEPARTURE: 'startStopNumber',
                STOP_POSITION_DESTINATION: 'endStopNumber',
                STOP_POSITION_DESTINATION_RETURN: 'endStopNumberRetour',
                STOP_POSITION_DEPARTURE_RETURN: 'startStopNumberRetour',
                STOP_POSITION_STOPOVER: 'stopoverStopNumber',
                STOP_POSITIONS_STOPOVERS: 'StopPosStopsCollec',
            };

            // Gabarit Tournée : la tournée est aussi dans la grille des cartes
            const TOUR_LAYOUT_ID = '94e653b0-9a07-4be6-ad9b-6efaa44d9982';

            const getTransportRows = () => {
                if (Array.isArray(window.transportsData) && window.transportsData.length && window.location.href.includes(window.transportsDataTourId)) return window.transportsData;
                const cardRows = (store.moduleStore.tableDatas?.Tournee_section_cards?.rows || [])
                    .filter(row => row.formLayoutId !== TOUR_LAYOUT_ID && row.data?.FORMLAYOUTNAME !== 'Tournée');
                return cardRows.length ? cardRows : (store.moduleStore.tableDatas?.GridTourneeTransportations?.rows || []);
            };

            // ============================================================================
            // UTILITIES
            // ============================================================================
            const createOrUpdateElement = (id, tag, style, innerHTML = '') => {
                let element = document.getElementById(id);
                if (!element) {
                    element = document.createElement(tag);
                    element.id = id;
                    document.body.appendChild(element);
                }
                element.style = style;
                element.innerHTML = innerHTML;
                return element;
            };
            
            const showErrorBanner = (errorMessage) => {
                const errorBanner = createOrUpdateElement(
                    'errorBanner',
                    'div',
                    `
                  position: fixed;
                  top: 20px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: auto;
                  min-width: 300px;
                  height: 50px;
                  background-color: white;
                  color: black;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  z-index: 9999;
                  border-radius: 5px;
                  padding: 0 20px;
                  box-shadow: 0 0 10px rgba(0,0,0,0.5);
                `,
                    `
            <div style='margin-right: 10px; color: red;'>&#x26A0;</div><div>${errorMessage}</div>
            <div id='errorBannerProgress' style='position: absolute; bottom: 0; left: 0; background-color: red; height: 5px; width: 0%;'></div>
                `
                );
                let progressElement = document.getElementById('errorBannerProgress');
                let width = 0;
                let interval = setInterval(() => {
                    if (width >= 100) {
                        clearInterval(interval);
                        errorBanner.style.display = 'none';
                    } else {
                        width++;
                        progressElement.style.width = width + '%';
                    }
                }, 55); // La barre progresse sur 5 secondes
            };

            const updateManyDocument = async (docs) => {
                const response = await api({ local: true }).put('document/Many', { documents: docs });
                if (!response || response.status < 200 || response.status >= 300) throw new Error('document/Many : statut ' + response?.status);
            };

            // ============================================================================
            // BUSINESS LOGIC
            // ============================================================================
            // La 303 (km) lit la position de chaque ligne d'un groupe : elle suit la liste
            const STOPOVER_ROW_POSITION = 'StopoverLocations|4000|StopPos|';

            const writeStopoverRowPositions = (transport, target) => {
                const positions = String(target[TRANSPORT_KEYS.STOP_POSITIONS_STOPOVERS] || '').split('|').filter(Boolean);
                const rowCount = Number(transport.StopoverLocations) || 0;
                if (!positions.length || rowCount !== positions.length) return;
                positions.forEach((position, index) => { target[STOPOVER_ROW_POSITION + (index + 1)] = String(position); });
            };

            const getStopoverRowPositions = transport => Object.keys(transport)
                .filter(key => key.startsWith(STOPOVER_ROW_POSITION) && Number(key.slice(STOPOVER_ROW_POSITION.length)) > 0)
                .reduce((rows, key) => ({ ...rows, [key]: transport[key] }), {});

            // Avec une recherche active, les cartes visibles gardent les numéros qu'elles occupaient déjà
            const isPosition = value => value !== undefined && value !== null && value !== '' && Number.isFinite(Number(value));

            const countTransportCards = () => getTransportRows().reduce((count, row) => {
                const transport = row.data || row;
                const positions = Object.values(TRANSPORT_KEYS)
                    .filter(key => key !== TRANSPORT_KEYS.STOP_POSITIONS_STOPOVERS)
                    .map(key => transport[key]);
                const stopovers = String(transport[TRANSPORT_KEYS.STOP_POSITIONS_STOPOVERS] || '').split('|').filter(Boolean);
                return count + [...positions, ...stopovers].filter(isPosition).length;
            }, 0);

            const findTourRow = () => {
                const tourRows = (store.moduleStore.tableDatas?.Tournee_section_cards?.rows || [])
                    .filter(row => row.formLayoutId === TOUR_LAYOUT_ID || row.data?.FORMLAYOUTNAME === 'Tournée');
                return tourRows.find(row => window.location.href.includes(row.documentID || row.rowID)) || tourRows[0];
            };

            const countHomeCards = () => {
                const tourRow = findTourRow();
                if (!tourRow) return 0;
                const savedAfterDrag = window.tourHomePositions?.[tourRow.documentID || tourRow.rowID];
                const value = savedAfterDrag !== undefined ? savedAfterDrag : tourRow.data?.PositionDomicileChauffeur;
                return (Array.isArray(value) ? value : String(value || '').split('|'))
                    .filter(position => isPosition(position) && Number(position) > 0).length;
            };

            const getDropPositions = () => {
                const previousPositions = dnd.drop.items
                    .map(item => Number(item.row?.data?.Stop_Position))
                    .sort((first, second) => first - second);
                const isFiltered = dnd.drop.items.length < countTransportCards() + countHomeCards();
                const keepPreviousPositions = isFiltered && previousPositions.every(Number.isFinite);
                return dnd.drop.items.map((item, index) => (keepPreviousPositions ? previousPositions[index] : index + 1));
            };

            const buildNewTransportsCollection = dropPositions => {
                const transports = JSON.parse(JSON.stringify(getTransportRows()));
                const updatedTransports = JSON.parse(JSON.stringify(transports));

                const stopIDs = dnd.drag.items.reduce((acc, item) => {
                    const data = item.row?.data || {};
                    const occurrenceKey = data.Transport_OccurrenceKey || item.key;
                    if (occurrenceKey) {
                        acc[String(occurrenceKey)] = {};
                    }
                    return acc;
                }, {});

                dnd.drop.items.forEach((item, index) => {
                    const data = item.row?.data || {};
                    const occurrenceKey = data.Transport_OccurrenceKey || item.key;
                    if (occurrenceKey && stopIDs[String(occurrenceKey)]) {
                        stopIDs[String(occurrenceKey)].finalPosition = dropPositions[index];
                    }
                });

                transports.forEach((transportRow, transportIndex) => {
                    const transport = transportRow.data || transportRow;
                    const target = updatedTransports[transportIndex].data
                        || updatedTransports[transportIndex];
                    const transportID = transportRow.documentID || transportRow.rowID;
                    const finalPositions = {};

                    dnd.drop.items.forEach((item, index) => {
                        const data = item.row?.data || {};
                        if (String(data.Transport_RowID) !== String(transportID)) return;
                        finalPositions[data.Transport_OccurrenceKey] = dropPositions[index];
                    });

                    const positionKeys = [
                        'startStopNumber',
                        'endStopNumber',
                        'endStopNumberRetour',
                        'startStopNumberRetour',
                        'stopoverStopNumber',
                    ];

                    positionKeys.forEach(key => {
                        if (transport[key] === undefined || transport[key] === '') return;
                        const occurrenceKey = `${transportID}-${key}`;
                        if (finalPositions[occurrenceKey] !== undefined) {
                            target[key] = finalPositions[occurrenceKey];
                        }
                    });

                    if (transport[TRANSPORT_KEYS.STOP_POSITIONS_STOPOVERS]) {
                        target[TRANSPORT_KEYS.STOP_POSITIONS_STOPOVERS] =
                            String(transport[TRANSPORT_KEYS.STOP_POSITIONS_STOPOVERS])
                                .split('|')
                                .map((position, index) => finalPositions[`${transportID}-${TRANSPORT_KEYS.STOP_POSITIONS_STOPOVERS}|${index}`] || position)
                                .join('|');
                        writeStopoverRowPositions(transport, target);
                    }
                });

                return updatedTransports;
            }

            const updateTransports = async (updatedTransports) => {
                const docs = [];

                updatedTransports.forEach(transportRow => {
                    const transport = transportRow.data || transportRow;
                    const documentID = transportRow.documentID || transportRow.rowID;
                    if (!documentID) return;

                    docs.push({
                        documentID,
                        data: JSON.stringify({
                            startStopNumber: transport[TRANSPORT_KEYS.STOP_POSITION_DEPARTURE],
                            endStopNumber: transport[TRANSPORT_KEYS.STOP_POSITION_DESTINATION],
                            startStopNumberRetour: transport[TRANSPORT_KEYS.STOP_POSITION_DEPARTURE_RETURN],
                            endStopNumberRetour: transport[TRANSPORT_KEYS.STOP_POSITION_DESTINATION_RETURN],
                            stopoverStopNumber: transport[TRANSPORT_KEYS.STOP_POSITION_STOPOVER],
                            StopPosStopsCollec: transport[TRANSPORT_KEYS.STOP_POSITIONS_STOPOVERS],
                            ...getStopoverRowPositions(transport),
                        }),
                        status: transportRow.status,
                        active: 'true',
                        template: { templateId: transportRow.formLayoutId }
                    });
                });

                await updateManyDocument(docs);
            }

            const HOME_TYPE = 'Retour au domicile';

            const buildHomeUpdate = dropPositions => {
                const homeStops = dnd.drop.items
                    .map((item, index) => ({ data: item.row?.data || {}, position: dropPositions[index] }))
                    .filter(stop => stop.data.Stop_Type === HOME_TYPE);
                if (!homeStops.length) return null;
                const { Transport_RowID, Tour_Status, Tour_FormLayoutId } = homeStops[0].data;
                return {
                    tourId: Transport_RowID,
                    status: Tour_Status,
                    templateId: Tour_FormLayoutId,
                    positions: homeStops.map(stop => stop.position).join('|'),
                };
            };

            const saveHomePositions = async homeUpdate => {
                if (!homeUpdate) return;
                await api({ local: true }).put('document', {
                    document: {
                        documentID: homeUpdate.tourId,
                        data: JSON.stringify({ PositionDomicileChauffeur: homeUpdate.positions }),
                        status: homeUpdate.status,
                        active: true,
                        template: { templateId: homeUpdate.templateId }
                    },
                    // Sans notification : évite l'alerte « modifié par un autre utilisateur » sur la tournée ouverte
                    preventNotify: 'DOCUMENT'
                });
                window.tourHomePositions = { ...(window.tourHomePositions || {}), [homeUpdate.tourId]: homeUpdate.positions };
            };

            const MOVE_FAILED_MESSAGE = 'Le déplacement n’a pas pu être effectué. Actualisez la page puis réessayez.';

            const getCurrentTourId = () => {
                const tourRow = findTourRow();
                return tourRow ? tourRow.documentID || tourRow.rowID : null;
            };

            // En cas d'échec, les cartes reprennent l'ordre enregistré
            const clearDisplayedOrder = () => {
                window.transportsData = null;
                const tourId = getCurrentTourId();
                if (tourId && window.tourHomePositions) delete window.tourHomePositions[tourId];
            };

            const main = async () => {
                try {
                    const dropPositions = getDropPositions();
                    const updatedTransports = buildNewTransportsCollection(dropPositions);
                    const homeUpdate = buildHomeUpdate(dropPositions);
                    // Affichage mis à jour avant d'enregistrer : le rafraîchissement des cartes relit ces valeurs
                    window.transportsData = updatedTransports;
                    window.transportsDataTourId = getCurrentTourId();
                    if (homeUpdate) window.tourHomePositions = { ...(window.tourHomePositions || {}), [homeUpdate.tourId]: homeUpdate.positions };
                    await saveHomePositions(homeUpdate);
                    await updateTransports(updatedTransports);
                    // Une fois les grilles rechargées, les cartes relisent les données enregistrées
                    setTimeout(() => {
                        window.transportsData = null;
                        if (homeUpdate && window.tourHomePositions) delete window.tourHomePositions[homeUpdate.tourId];
                    }, 3000);
                    injectDocData({
                        fillData: {
                            Transports: updatedTransports,
                            ...(homeUpdate ? { PositionDomicileChauffeur: homeUpdate.positions } : {})
                        }
                    });

                } catch (error) {
                    console.error('Erreur glisser-déposer tournée :', error);
                    clearDisplayedOrder();
                    showErrorBanner(MOVE_FAILED_MESSAGE);
                }
            }

            main()