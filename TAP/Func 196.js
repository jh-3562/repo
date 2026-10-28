const age = docData["Age"];
const expi = docData['Date_expiration'];
const transport = docData['Dates_DateTransport'];
const organisme = docData['Prix_transport'];

if (expi && transport && organisme === 'Sécurité du Revenu') {
  
	let DateExpi = new Date(expi.substring(0, 10))
    let d = new Date(transport.substring(0, 10))
    
   	if (d >= DateExpi) {
        return {'AttentionDateExpi': true};
    }
   	
    else if (age >= 65) {
        return {'AttentionDateExpi': true};
    }
    
    else { 
    	return {'AttentionDateExpi': null}
    }
} 

else if (age && organisme === 'Sécurité du Revenu') {

	if (age >= 65) {
        return {'AttentionDateExpi': true};
    }
   
    else { 
    	return {'AttentionDateExpi': null}
    }
}

else {return {'AttentionDateExpi': null}}
