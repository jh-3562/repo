console.log('Function 44', context);

const isDev = store.moduleStore.user.roles;

if(isDev.includes('1. DEVELOPPEUR')){
	return {Chauffeur_Information_Dev : true }
} else{
	return {Chauffeur_Information_Dev : null }
};
