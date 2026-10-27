console.log('AnnulerOccurences', context);

const DEMANDE_TEMPLATE_ID = '5d7b4e39-c50a-428c-87ec-e9b68ac45e39';
const TRANSPORT_TEMPLATE_ID = '017d9a14-b828-4cc5-8a9a-8906c1fcab59';

const updateDocumentMany = async (documents) => {
  await api({ local: true }).put('document/Many', { documents });
};

const buildDateTime = (date, heure) => {
  const d = String(date || '').trim();
  const h = String(heure || '').trim();
  if (!d || !h) return null;
  const [hh = '00', mm = '00'] = h.split(':');
  return `${d}T${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:00`;
};

const main = async () => {
  try {
    // 1. Récupérer la date d'annulation de la popup
    const rawDate = store.pageContentStore.processData[0].edits.DateAnnulation;
    const dateAnnulation = new Date(rawDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateCheck = new Date(dateAnnulation);
    dateCheck.setHours(0, 0, 0, 0);

    if (dateCheck < today) {
      showErrorBanner("La date d'annulation ne peut pas être dans le passé.");
      return;
    }

    const dateAnnulationISO = dateAnnulation.toISOString().split('T')[0];
    const mereId = docData.FORMID;

    showPopupLoading('Annulation des occurrences…');
    console.log(
      `[AnnulerOccurences] Annulation à partir du ${dateAnnulationISO} pour mère ${mereId}`,
    );

    // 2. Récupérer toutes les demandes pour trouver les occurrences de cette mère
    const filterResponse = await api({ local: true }).post(
      'document/id/filter',
      {
        filters: [
          {
            key: 'FORMLAYOUTNAME',
            operator: 'EQUALS',
            value: 'Demande',
            type: 'TEXT',
          },
        ],
      },
    );

    const allIds = filterResponse?.data?.ids ?? [];
    let occurrencesToCancel = [];
    const transportIdsToCancel = [];

    if (allIds.length > 0) {
      const docsResponse = await api({ local: true }).post('document/id', {
        ids: allIds,
      });
      const allDocs = docsResponse?.data?.documents ?? [];

      // 3. Filtrer : occurrences de cette mère, date >= date d'annulation, pas déjà annulées
      for (const doc of allDocs) {
        if (doc.documentID === mereId) continue;
        if (doc.status === 'Annulé' || doc.status === 'Principal') continue;

        const data =
          typeof doc.data === 'string' ? JSON.parse(doc.data) : doc.data;

        if (data.Demande_Transport_IdRecurrence !== mereId) continue;

        const dateDebut = String(data.Demande_DateHeureDebut || '').split(
          'T',
        )[0];
        if (dateDebut >= dateAnnulationISO) {
          occurrencesToCancel.push({ doc, data });

          if (data.Demande_IDTransportAller) {
            transportIdsToCancel.push(data.Demande_IDTransportAller);
          }
          if (data.Demande_IDTransportRetour) {
            transportIdsToCancel.push(data.Demande_IDTransportRetour);
          }
        }
      }
    }

    console.log(
      `[AnnulerOccurences] ${occurrencesToCancel.length} occurrence(s) à annuler, ${transportIdsToCancel.length} transport(s)`,
    );

    // 4. Annuler les occurrences (demandes)
    if (occurrencesToCancel.length > 0) {
      const demandeUpdates = occurrencesToCancel.map(({ doc, data }) => ({
        data: JSON.stringify(data),
        status: 'Annulé',
        active: true,
        template: { templateId: DEMANDE_TEMPLATE_ID },
        documentID: doc.documentID,
      }));
      await updateDocumentMany(demandeUpdates);
    }

    // 5. Annuler les transports liés
    if (transportIdsToCancel.length > 0) {
      const transportResponse = await api({ local: true }).post('document/id', {
        ids: transportIdsToCancel,
      });
      const transports = transportResponse?.data?.documents ?? [];

      const transportUpdates = transports
        .filter((t) => t.status !== 'Annulé')
        .map((transport) => {
          const tData =
            typeof transport.data === 'string'
              ? JSON.parse(transport.data)
              : transport.data;
          return {
            data: JSON.stringify(tData),
            status: 'Annulé',
            active: true,
            template: { templateId: TRANSPORT_TEMPLATE_ID },
            documentID: transport.documentID,
          };
        });

      if (transportUpdates.length > 0) {
        await updateDocumentMany(transportUpdates);
      }
    }

    // 6. Mettre à jour la récurrence mère pour empêcher les futures occurrences
    const frequence = String(
      docData.Demande_Transport_FréquenceRécurrence || '',
    ).trim();
    const type = String(docData.Transport_TypeTransport || '').trim();
    const mereUpdate = { ...docData };

    if (frequence === 'Hebdomadaire') {
      // Mettre la date de fin à la veille de la date d'annulation
      const veille = new Date(dateAnnulationISO + 'T00:00:00Z');
      veille.setUTCDate(veille.getUTCDate() - 1);
      const nouvelleDateFin = veille.toISOString().split('T')[0];
      mereUpdate.Demande_DateFinRecurrences = nouvelleDateFin;

      // Recalculer Demande_DateHeureFin
      let heureFin = null;
      if (type === 'Aller') heureFin = docData.DemandeAllerA_Heure;
      else if (type === 'Retour') heureFin = docData.DemandeRetourA_Heure;
      else if (type === 'Aller/Retour') heureFin = docData.DemandeRetourA_Heure;
      mereUpdate.Demande_DateHeureFin = buildDateTime(
        nouvelleDateFin,
        heureFin,
      );
    } else if (frequence === 'Variable') {
      // Retirer les dates >= date d'annulation
      const dates = String(docData.Demande_DatesRecurrences || '')
        .split('|')
        .filter(Boolean);
      const keptDates = dates.filter((d) => d.trim() < dateAnnulationISO);
      mereUpdate.Demande_DatesRecurrences = keptDates.join('|');

      // Recalculer Demande_DateHeureFin avec la dernière date restante
      if (keptDates.length > 0) {
        const lastDate = keptDates.sort().pop();
        let heureFin = null;
        if (type === 'Aller') heureFin = docData.DemandeAllerA_Heure;
        else if (type === 'Retour') heureFin = docData.DemandeRetourA_Heure;
        else if (type === 'Aller/Retour')
          heureFin = docData.DemandeRetourA_Heure;
        mereUpdate.Demande_DateHeureFin = buildDateTime(lastDate, heureFin);
      }
    }

    await updateDocumentMany([
      {
        data: JSON.stringify(mereUpdate),
        status: 'Principal',
        active: true,
        template: { templateId: DEMANDE_TEMPLATE_ID },
        documentID: mereId,
      },
    ]);

    hidePopupLoading();
    showSuccessBanner(
      `${occurrencesToCancel.length} occurrence(s) annulée(s) à partir du ${dateAnnulationISO}.`,
    );
  } catch (err) {
    hidePopupLoading();
    console.error('[AnnulerOccurences] Erreur:', err);
    showErrorBanner(err?.message || "Erreur lors de l'annulation.");
  }
};

main();
