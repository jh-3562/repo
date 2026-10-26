console.log('Function 35', context);

const isDev = store.moduleStore.user.roles;

if(isDev.includes('1. DEVELOPPEUR')){
	return {CC_Latitude: true, CC_Longitude: true , 'CC_Destinations|800|Latitude': true, 'CC_Destinations|900|Longitude': true, PriseEnCharge_LatitudeDépartChauffeur:true, PriseEnCharge_LongitudeDépartChauffeur:true};
} else{
	return {CC_Latitude: null, CC_Longitude: null , 'CC_Destinations|800|Latitude': null, 'CC_Destinations|900|Longitude': null, PriseEnCharge_LatitudeDépartChauffeur:null, PriseEnCharge_LongitudeDépartChauffeur:null};
};