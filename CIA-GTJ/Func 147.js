console.log("Function 147", context);

async function appeln8n(payload) {
  const response = await fetch(
    "http://localhost:5678/webhook/FeuilleDeRoute",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `L'appel n8n a échoué (${response.status}): ${errorBody || "réponse vide"}`,
    );
  }

  return response;
}

async function main() {
  const payload = [
    {
      daterange: store.pageStore.filterData.Demande_DateHeureDebut,
      transporteur: store.pageStore.filterData.Operation_NomDuTransporteur,
      action: "imprimer",
    },
  ];

  console.log("Payload:", payload);

  try {
    const res = await appeln8n(payload);
    const n8nResponse = await res.json();
    console.log("Réponse n8n:", n8nResponse);
    if (!n8nResponse) {
      throw new Error("Réponse n8n invalide");
    }
    const files = Array.isArray(n8nResponse) ? n8nResponse : [n8nResponse];
    const fileUrls = files.map((item) => item.fileUrl).filter(Boolean);

    console.log("File URLs:", fileUrls);

    fileUrls.forEach((fileUrl) => {
      const fileName = decodeURIComponent(
        fileUrl.split("/").pop().split("?")[0],
      );
      const downloadLink = document.createElement("a");

      downloadLink.href = fileUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  } catch (error) {
    console.error("Erreur lors de l'appel n8n:", error);
  }
}

main();
