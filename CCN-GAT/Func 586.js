if (docData['EchangerPompe']==='true') {
    return {"NumeroPompeSearch":null}
}

else if (docData['ValiderPompe']==="true") {
    return {"NumeroPompeSearch":true}
}

else {console.log('else')
    return {"NumeroPompeSearch":null}}