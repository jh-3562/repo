console.log("Fonction 156", context);

const value = String(
  docData.Demande_TransportAccompagnementQuiFourniAccompagnateur || ""
).trim();

if (value === "Bénévole") {

  const modal = document.createElement("div");
  modal.innerHTML = `
    <div style="
      position:fixed;
      top:0;
      left:0;
      width:100%;
      height:100%;
      background:rgba(0,0,0,0.4);
      display:flex;
      align-items:center;
      justify-content:center;
      z-index:9999;
      font-family:Arial;
    ">
      <div style="
        background:white;
        padding:25px 30px;
        border-radius:10px;
        box-shadow:0 5px 20px rgba(0,0,0,0.2);
        text-align:center;
        max-width:400px;
      ">
        <h3 style="margin-top:0;color:#333;">Information</h3>
        <p style="font-size:15px;color:#555;">
          Veuillez organiser l'accompagnement
        </p>
        <button id="popupOkBtn" style="
          margin-top:15px;
          padding:8px 20px;
          background:#2d7ef7;
          border:none;
          border-radius:6px;
          color:white;
          cursor:pointer;
          font-size:14px;
        ">
          OK
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("popupOkBtn").onclick = () => {
    modal.remove();
  };
}

return {};
