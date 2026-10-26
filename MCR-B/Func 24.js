console.log('Function 24', context);

function formatDate () {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0') // Mois (commence à 0, donc on ajoute 1)
  const day = String(now.getDate()).padStart(2, '0') // Jour
  const hours = String(now.getHours()).padStart(2, '0') // Heure
  const minutes = String(now.getMinutes()).padStart(2, '0') // Minutes
  const seconds = String(now.getSeconds()).padStart(2, '0') // Secondes

  // Retourne la date dans le format demandé
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

if (docData.STATUS === 'Draft') {
  return {
    InformationsAdmin_DateHeureDébut: formatDate(),
    InformationsAdmin_DateHeureFin: formatDate()
  }
}
