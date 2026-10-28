console.log('Function 307', context)

const transportationDate = new Date(docData['Dates_DateTransport'])
console.log(typeof transportationDate, transportationDate)

const currentDate = new Date().setHours(0, 0, 0, 0)

if (transportationDate < currentDate) {
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

  // to hide the popup
  const hidePopupLoading = () => {
    const loadingPopup = document.getElementById('loadingPopup')
    if (loadingPopup) loadingPopup.style.display = 'none'
  }

  // creates the popup
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
						<div>Attention : Vous êtes en train d'inscrire un transport dont la date est déjà passée.</div>
						<button id="closePopupBtn" style="border: 2px solid #3498db; background-color: #3498db; color: #FFFFFF; width: 50px; height: 30px; border-radius: 10px; margin-top: 20px;">Ok</button>
					  </div>
					`
  )
  // button to close the popup
  const closePopupButton = document.getElementById('closePopupBtn')
  if (closePopupButton) {
    closePopupButton.addEventListener('click', hidePopupLoading)
  }
}
