if (
  docData.Demande_TransportAccompagnementQuiFourniAccompagnateur === "Organisme"
) {
  return {
    Accompagnateur_Emploi: "Bénévole",
  };
} else if (docData?.Accompagnateur_Emploi === "Bénévole") {
  return {
    Accompagnateur_Emploi: null,
  };
}

