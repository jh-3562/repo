console.log('Function 74', context);

const isDev = store.moduleStore.user.roles;

if(isDev.includes('1. DEVELOPPEUR')){
	return {InformationDEVELOPPEUR : true }
} else{
	return {InformationDEVELOPPEUR : null }
};
