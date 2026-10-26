console.log('Function 110', context);

const isDev = store.moduleStore.user.roles;
return {
    Facture_Information_Dev: isDev.includes('1. DEVELOPPEUR') ? true : null
};