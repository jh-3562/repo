console.log("Function 62", context);

function timeSince(date) {
    const now = new Date();
    const past = new Date(date);

    let years = now.getFullYear() - past.getFullYear();
    let months = now.getMonth() - past.getMonth();
    let days = now.getDate() - past.getDate();

    if (days < 0) {
        months--;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    return { years, months, days };
}

const main = () => {
    const dateNaissance = docData["Demande_IdentificationIdentficationUsagerDateNaissance"];
    console.log("Date de naissance", dateNaissance);
    const result = timeSince(dateNaissance);
    const textResult = result.years + " ans, " + result.months + " mois, " + result.days + " jours";
    console.log("Âge calculé", textResult);
    return { Demande_IdentificationIdentficationUsagerÂge: textResult };
};

return main();
