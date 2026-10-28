if (docData["AjoutClient"]) {
    const data = {
//Contrainte:docData["Contrainte"],
//Contact:docData["Contact"],
Date_expiration:docData["Date_expiration"],
'Langue_parlees':docData["Langue_parlees"],
'No_CLE':docData["No_CLE"],
'Accompagnement_obligatoire':docData["Accompagnement_obligatoire"],
Age:docData["Age"],
'Patient_DateNaissance':docData["Patient_DateNaissance"],
'Patient_Sexe':docData["Patient_Sexe"],
'Adapte_check':docData["Adapte_check"],
CommentairesClient:docData["CommentairesClient"],
'Organisme_client':docData["Organisme_client"],
'Domicile_Adresse':docData["Domicile_Adresse"],
"Contrainte|2|NomClient":docData["Contrainte|2|NomClient"],
Telephone1:docData["Telephone1"],
Telephone2:docData["Telephone2"]
    };
    for (let propName in data) {
        if (!data[propName]) {
            delete data[propName];
        }
    }
    api({
        local: true,
    })
        .post("document", {
            document: {
                data: JSON.stringify(data),
                status: "ACTIF",
                active: true,
                template: {
                    templateId: "2e8c1e71-d98f-4ed8-a04b-6cc3c8d82b31",
                },
            },
        })
        .then((res) =>
            callback({
                data: {
                },
            })
        );
}