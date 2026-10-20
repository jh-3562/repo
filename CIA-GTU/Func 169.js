console.log("Function 169", context);

const roleUser = store.moduleStore.user.roles[0];

function createModal() {
  if (document.getElementById("customModal")) return;

  const style = document.createElement("style");
  style.textContent = `
    #customModal {
      display: none;
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 9999;
    }
    #customModal .modal-content {
      background: white;
      padding: 24px;
      border-radius: 10px;
      width: 340px;
      margin: 15% auto;
      text-align: center;
      font-family: Arial, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    #customModal h2 {
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    #customModal p {
      font-size: 14px;
      color: #333;
    }
    #customModal button {
      margin-top: 18px;
      padding: 10px 18px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    #customModal button:hover {
      background-color: #0056b3;
    }
  `;
  document.head.appendChild(style);

  const modal = document.createElement("div");
  modal.id = "customModal";
  modal.innerHTML = `
    <div class="modal-content">
      <h2>⚠️ Attention</h2>
      <p id="modalMessage"></p>
      <button id="confirmBtn">Confirmer</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function showModal(message) {
  createModal();

  const modal = document.getElementById("customModal");
  const text = document.getElementById("modalMessage");

  text.textContent = message;
  modal.style.display = "block";

  return new Promise((resolve) => {
    document.getElementById("confirmBtn").onclick = () => {
      modal.style.display = "none";
      resolve(true);
    };
  });
}

async function main() {
  if (docData["Demande_ToileLevier"] !== "true" || roleUser !== "DÉPARTEMENT") {
    return;
  }

  await showModal(
    "Assurez-vous que l’établissement receveur dispose d’un levier.",
  );
}

main();
