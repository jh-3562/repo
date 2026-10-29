if (
  docData.Demande_TransportAccompagnementQuiFourniAccompagnateur === "Organisme"
) {
  return {
    Accompagnateur_Emploi: true,
  };
} else {
  return {
    Accompagnateur_Emploi: false,
  };
}

