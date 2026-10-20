console.log("Function 247", context);

const isNew = window.location.href.includes("new");

if (isNew) {
    return {
        Demande_TransportInformationTransportAvecReccurence: false
    };
}
return;
