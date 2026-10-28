console.log("Fonction 522", context);

const expi = docData.endDate;
const transport = docData.Dates_DateTransport;

if (!expi || !transport) {
  return;
}

const expiDate = expi.substring(0, 10);
const transportDate = transport.substring(0, 10);

const isExpired = new Date(transportDate) >= new Date(expiDate);

if (isExpired) {
  // Empêche plusieurs popups
  if (!document.getElementById('popupTransportExpi')) {
    const popup = document.createElement('div');
    popup.id = 'popupTransportExpi';
    
    popup.innerHTML = `
      <div style="
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      ">
        <div style="
          background: #fff;
          border-radius: 8px;
          padding: 20px;
          width: 400px;
          max-width: 90%;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          position: relative;
          display: flex;
          flex-direction: column;
        ">
          <div style="font-weight: bold; font-size: 18px; color: #000000ff; margin-bottom: 10px;">Attention</div>
          <div style="flex: 1; margin-bottom: 20px; line-height: 1.4;">
            Transport adapté temporaire expiré.<br>
            Date de fin : <strong>${expiDate}</strong><br>
            Date du rendez-vous : <strong>${transportDate}</strong>
          </div>
          <div style="text-align: right;">
            <button id="popupConfirm" style="
              background-color: rgba(38, 117, 200, 1);
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            ">Confirmer</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(popup);

    // Fermeture du popup au clic sur le bouton
    document.getElementById('popupConfirm').onclick = () => {
      document.getElementById('popupTransportExpi').remove();
    };
  }
}