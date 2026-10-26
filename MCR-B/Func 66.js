console.log('Function 66', context);

const isDev = store.moduleStore.user.roles;

if(isDev.includes('1. DEVELOPPEUR')){
	return {InfoDevsMission : true }
} else{
	return {InfoDevsMission : null }
};