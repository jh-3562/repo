const date = new Date();
const daysSinceMonday = date.getDay() === 0 ? 6 : date.getDay() - 1;
const start = new Date(date);
start.setDate(date.getDate() - daysSinceMonday + 7);
const end = new Date(start);
end.setDate(start.getDate() + 7);
const format = (currentDate) =>
  `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
const value = `${format(start)}|${format(end)}`;
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

