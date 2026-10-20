console.log("Function 199", context);

const { Identite_TypeIdentification } = docData;

return {
    Identite_TypeIdentificationMarkdown:
        Identite_TypeIdentification !== 'RAMQ'
            ? '<span style="color:red;">S’assurer d’informer l’usager que les frais de transport seront assumés par lui</span>'
            : ''
};
