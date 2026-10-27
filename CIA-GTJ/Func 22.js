console.log("function 22", context);
// ================== Utils ==================
const isEmpty = (v) => v === null || v === undefined || String(v).trim() === "";

const toNumber = (v) => {
  if (isEmpty(v)) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
};

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const lat1 = toNumber(docData.Transport_Latitude);
const lon1 = toNumber(docData.Transport_Longitude);
const lat2 = toNumber(docData.Transport_LatitudeAllerA);
const lon2 = toNumber(docData.Transport_LongitudeAllerA);

if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
  return {
    Transporteur_TrajetAller: null,
  };
}

const distance = calculateDistanceKm(lat1, lon1, lat2, lon2);

const distanceRounded = Math.round(distance * 100) / 100;

return {
  Demande_TrajetAller: distanceRounded,
};
