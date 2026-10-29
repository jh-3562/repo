const date = new Date();
const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const value = `${formattedDate}|${formattedDate}`;
const key = "TransportSysteme_DateDebut";
try {
  if (sessionStorage.getItem(key) === value) {
    sessionStorage.removeItem(key);
  } else {
    sessionStorage.setItem(key, value);
  }
  const result = sessionStorage.getItem(key) || "";
  window.location.reload();
  return result;
} catch (error) {
  return "";
}

