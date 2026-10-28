console.log("Function 517",context);

const sourceData = indexItemChange === undefined ? docData : docData.Contrainte[indexItemChange];

const fields = {
  keyFieldOnchange: inputKey,
  dataFieldOnchange: sourceData[inputKey],
  targetSearchField: "Contrainte|1|Chauffeur",
};

const apiFiltersChauffeur = [
    {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Chauffeur",
        type: "TEXT",
    },
    {
        key: "STATUS",
        operator: "EQUALS",
        value: "ACTIF",
        type: "TEXT",
    },
    {
        key: fields.targetSearchField,
        operator: "EQUALS",
        value: fields.dataFieldOnchange,
        type: "TEXT",
    }
];


const apiFiltersIndispo = (IndispoStart, IndispoEnd) => [
    {
        key: "FORMLAYOUTNAME",
        operator: "EQUALS",
        value: "Indisponibilité",
        type: "TEXT",
    },
    {
        key: fields.targetSearchField,
        operator: "EQUALS",
        value: fields.dataFieldOnchange,
        type: "TEXT",
    },
    {
        key: 'DateTime_Start',
        operator: 'BETWEEN',
        value: IndispoStart,
        type: 'DATETIME'
    },
    {
        key: 'DateTime_End',
        operator: 'BETWEEN',
        value: IndispoEnd,
        type: 'DATETIME'
    },
];


// function to hide the popuploading
const hidePopupLoading = () => {
  const loadingPopup = document.getElementById('loadingPopup')
  if (loadingPopup) loadingPopup.style.display = 'none'
}

// function to show the popup loading
const showPopupLoading = loadingMessage => {
  // function to create the popup loading element
  const createOrUpdateElement = (id, tag, style, innerHTML = '') => {
    let element = document.getElementById(id)
    if (!element) {
      element = document.createElement(tag)
      element.id = id
      document.body.appendChild(element)
    }
    element.style = style
    element.innerHTML = innerHTML
    return element
  }
  createOrUpdateElement(
    'loadingPopup',
    'div',
    `
              position: fixed;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0,0,0,0.5);
              display: flex;
              justify-content: center;
              align-items: center;
              z-index: 9999;
            `,
    `
              <div style="background-color: white; padding: 20px; border-radius: 5px; display: flex; flex-direction: column; align-items: center;">
                <div>${loadingMessage}</div>
                <div class="loader" style="border: 6px solid #f3f3f3; border-top: 6px solid #3498db; border-radius: 50%; width: 40px; height: 40px; margin-top: 20px; animation: spin 1s linear infinite;"></div>
              </div>
            `
  )
  if (!document.getElementById('spinnerStyle')) {
    let style = document.createElement('style')
    style.id = 'spinnerStyle'
    style.innerHTML = `
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `
    document.head.appendChild(style)
  }
}

const showCustomPopup = ({ title, commentHTML, fields, buttons }) => {
  // Crée un input selon le type et applique un mask si nécessaire
  function getInput ({
    key,
    name,
    type,
    options,
    mask,
    style,
    defaultValue,
    min,
    max,
    required
  }) {
    const wrapper = document.createElement('div')
    wrapper.className = 'popup-input'
    const label = document.createElement('label')
    label.textContent = name || key
    label.htmlFor = key
    let input
    switch (type.toLowerCase()) {
      case 'select':
        input = document.createElement('select')
        input.name = key
        if (style) input.style = style
        input.id = key
        ;(options || []).forEach(({ value, label }) => {
          const opt = document.createElement('option')
          opt.value = value
          opt.textContent = label
          input.appendChild(opt)
        })
        wrapper.append(label, input)
        break
      case 'checkbox':
        input = document.createElement('input')
        input.type = 'checkbox'
        input.name = key
        if (style) input.style = style
        input.id = key
        wrapper.classList.add('popup-input-row')
        wrapper.append(input, label)
        break
      case 'number':
        input = document.createElement('input')
        input.type = 'number'
        input.name = key
        if (style) input.style = style
        if (defaultValue !== undefined) input.value = defaultValue
        if (min !== undefined) input.min = min
        if (max !== undefined) input.max = max
        if (required) input.required = true
        input.step = 1
        input.id = key
        input.addEventListener('input', () => {
          input.value = input.value.replace(/[^\d]/g, '')
        })
        wrapper.append(label, input)
        break
      case 'label':
        const span = document.createElement('span')
        span.innerHTML = name || ''
        if (style) span.style = style
        wrapper.appendChild(span)
        break
      default:
        input = document.createElement('input')
        input.type = type.toLowerCase()
        input.name = key
        if (style) input.style = style
        input.id = key
        if (mask instanceof RegExp) {
          applyRegexMask(input, mask)
        }
        wrapper.append(label, input)
        break
    }
    return wrapper
  }
  // Création POPUP
  const overlay = document.createElement('div')
  overlay.className = 'popup-overlay'
  const popup = document.createElement('div')
  popup.className = 'popup-box'
  const style = document.createElement('style')
  style.textContent = `
  .popup-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    animation: fadeInOverlay 0.15s ease-out;
  }
  @keyframes fadeInOverlay {
    from {
      background: rgba(0, 0, 0, 0);
    }
    to {
      background: rgba(0, 0, 0, 0.4);
    }
  }
  .popup-box {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    background: white;
    border-radius: 0.375rem;
    padding: 15px 25px;
    width: 500px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    animation: fadeInScale 0.15s ease-out;
  }
  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.95);
      background: rgba(0, 0, 0, 0);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  .popup-box h1,
  .popup-box h2,
  .popup-box h3,
  .popup-box p,
  .popup-box span {
    color: #202127;
  }
  .popup-box h2 {
    margin: 0 0 20px;
    font-size: 1.25rem;
  }
  .popup-box p,
  .popup-box span {
    font-size: 1rem;
  }
  .popup-comment {
    margin-bottom: 20px;
  }
  .popup-input {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
  }
  .popup-input-row {
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }
  .popup-input label {
    margin-bottom: 5px;
    font-size: 12px;
  }
  .popup-input input,
  .popup-input select {
    padding: 8px 10px;
    border: 1px solid #ccc;
    border-radius: 0.375rem;
    font-size: 1rem;
  }
  .popup-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  .popup-buttons button {
    border: none;
    padding: 3px 30px;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.875rem;
  }
  @media (max-width: 768px) {
    .popup-input input,
    .popup-input select {
        width: 100%;
    }
  }
`
  popup.appendChild(style)
  // Titre
  if (title) {
    const titleElem = document.createElement('h2')
    titleElem.textContent = title
    titleElem.style.fontWeight = 'bold'
    popup.appendChild(titleElem)
  }
  // Commentaire HTML
  if (commentHTML) {
    const comment = document.createElement('div')
    comment.className = 'popup-comment'
    comment.innerHTML = commentHTML
    popup.appendChild(comment)
  }
  // Champs
  if (fields)
    for (const field of fields) {
      popup.appendChild(getInput(field))
    }
  // Boutons
  const buttonRow = document.createElement('div')
  buttonRow.className = 'popup-buttons'
  if (buttons) {
    for (const { name, onClick, backgroundColor, color, preset } of buttons) {
      const btn = document.createElement('button')
      btn.textContent = name
      switch (preset) {
        case 'action':
          // Action bleu
          btn.style.backgroundColor = '#3182ce'
          btn.style.color = '#f2f7fb'
          break
        case 'cancel':
          // Cancel gris
          btn.style.backgroundColor = '#f5f5f6'
          btn.style.color = '#2c2d32'
          break
        default:
          // Action bleu
          btn.style.backgroundColor = '#3182ce'
          btn.style.color = '#f2f7fb'
          break
      }
      if (backgroundColor) btn.style.backgroundColor = backgroundColor
      if (color) btn.style.color = color
      btn.onclick = () => {
        const values = {}
        const inputs = popup.querySelectorAll('input, select')
        // Cas spécfifique avec les checkbox (on retourne true ou false)
        for (const el of inputs) {
          values[el.name] = el.type === 'checkbox' ? el.checked : el.value
        }
        onClick(values)
        document.body.removeChild(overlay)
      }
      buttonRow.appendChild(btn)
    }
  }
  popup.appendChild(buttonRow)
  overlay.appendChild(popup)
  document.body.appendChild(overlay)
}

const showPopupConfirmation = (titleInput, message) => {
  return new Promise(resolve => {
    showCustomPopup({
      title: titleInput,
      commentHTML: message,
      buttons: [
        {
          name: "Annuler l'assignation",
          backgroundColor: '#ffc9c9',
          color: '#1e1e1e',
          onClick: () => resolve(false)
        },
        {
          name: "Confirmer l'assignation",
          backgroundColor: '#b2f2bb',
          color: '#1e1e1e',
          onClick: () => resolve(true)
        }
      ]
    })
  })
}

const showPopupCancel = (titleInput, message) => {
  return new Promise(resolve => {
    showCustomPopup({
      title: titleInput,
      commentHTML: message,
      buttons: [
        {
          name: "Fermer",
          backgroundColor: '#2A76C9',
          color: '#F2F7FB',
          onClick: () => resolve(true)
        }
      ]
    })
  })
}


const userCancelledProcessGrid = async () => {

    const confirmed = await showPopupCancel(
        `Attention`,
        `Le chauffeur <strong>${fields.dataFieldOnchange}</strong> a une indisponibilité sur au moins un des transports sélectionnés`
    )
    return confirmed
}

const userCancelledProcess = async (dateStart, dateEnd) => {
    const [startDate, startTime] = dateStart.split('T');
    const [, endTime] = dateEnd.split('T');

    const confirmed = await showPopupConfirmation(
        `Attention`,
        `Le chauffeur <strong>${fields.dataFieldOnchange}<strong> à une indisponibilité le ${startDate} de ${startTime.slice(0, 5)} jusqu'à ${endTime.slice(0, 5)}`
    )
    return confirmed
}

// Async functions to get the Chauffeurs infos
const getChauffeurInfo = async () => {
    try {
        // Fetches IDs
        const idsRes = await api({ local: true }).post("document/id/filter", {
        filters: apiFiltersChauffeur,
        });
        const ids = idsRes?.data?.ids || [];

        // Fetches documents using IDs
        const res = await api({ local: true }).post("document/id", { ids });

        const documents = res?.data?.documents.map((doc) => {
        return JSON.parse(doc.data);
        });
        return documents;
    } catch (error) {
        console.error("Erreur lors de la récupération des documents :", error);
        throw error;
    }
};

// Async functions to get the Chauffeurs infos
const getIndisponibiliteInfo = async (apiFiltersIndispo) => {
    try {
        // Fetches IDs
        const idsRes = await api({ local: true }).post("document/id/filter", {
        filters: apiFiltersIndispo,
        });
        const ids = idsRes?.data?.ids || [];

        // Fetches documents using IDs
        const res = await api({ local: true }).post("document/id", { ids });

        const documents = res?.data?.documents.map((doc) => {
        return JSON.parse(doc.data);
        });
        return documents;
    } catch (error) {
        console.error("Erreur lors de la récupération des documents :", error);
        throw error;
    }
};

// Async functions to get the Chauffeurs infos
const getDocumentsByIDs = async (documentIDs) => {
    try {
        const response = await api({ local: true }).post("document/id", {
            ids: documentIDs,
        });

        return response?.data?.documents || [];
    } catch (error) {
        console.error("Failed to fetch document:", error);
        return [];
    }
};


const main = async () => {

    let IndispoStart = `0001-12-31|${docData.Dates_DateTransport}`;
    let IndispoEnd = `${docData.Dates_DateTransport}|9999-12-31`;

    if (store?.pageContentStore?.active?.length){
        const docTransport= await getDocumentsByIDs(store.pageContentStore.active);
        const transportDataParsed = JSON.parse(docTransport[0].data);

        IndispoStart = `0001-12-31|${transportDataParsed.Dates_DateTransport}`;
        IndispoEnd = `${transportDataParsed.Dates_DateTransport}|9999-12-31`;
    }

    if(indexItemChange !== undefined) return;

    const documents = await getChauffeurInfo();

    if (documents.length === 0) return;
 
    const indispos = await getIndisponibiliteInfo(apiFiltersIndispo(IndispoStart, IndispoEnd));
    if (indispos.length === 0) return;
    const { DateTime_Start, DateTime_End } = indispos[0];

    let userCancelled;
    if (store?.pageContentStore?.active?.length){
        userCancelled = await userCancelledProcessGrid();
    }else {
        userCancelled = await userCancelledProcess(
            DateTime_Start,
            DateTime_End
        );
    }

    if (userCancelled) return;
    callback({
        data: {
            'Contrainte|1|Chauffeur': '','ModeleRemuneration':'' ,'Chauffeur_Adresse': '', 'LongitudeChauffeur': '', 'LatitudeChauffeur': '', 'Chauffeur_Notes': '', 'VehiculeNo': ''
        }
    });
};

main();