switch (docData["STATUS"].toUpperCase()) {
  case "ACTIF":
    return { color: "#022914", backgroundColor: "#D0EACD" };

  case "INACTIF":
    return { color: "#1E1400", backgroundColor: "#F4E3C0" };

  default:
    return {};
}
