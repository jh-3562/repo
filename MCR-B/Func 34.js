console.log('Function 34', context);

const isDev = store.moduleStore.user.roles;

if(isDev.includes('1. DEVELOPPEUR')){
	return {Disponibilité_InformationAdmin : true }
} else{
	return {Disponibilité_InformationAdmin : null }
};
