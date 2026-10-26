console.log('Function 132', context);
const { FORMID } = docData;
const formLayoutID = "7c6d6132-ca2b-411c-86e9-baaaa130faa3";

// sync functions

/**
   * Get the viewGroup Url
   * This can be usefull in order to redirect the users
   * @returns
   */
const viewGroupUrl = () => {
    // Step 1: Get the current Url
    const currentUrl = window.location.href
    // Step 2 : Remove the unecessary segments
    const parts = currentUrl.split('/')
    for (let i = 0; i < 3; i++) {
        const lastpart = parts[parts.length - 1]
        if (isUUID(lastpart) || lastpart === 'new') {
            parts.pop()
        }
    }
    const viewGroupUrl = parts.join('/')
    return viewGroupUrl
}
  
/**
* Redirect the user to the last viewgroup
*/
const redirectToViewGroup = () => {
    window.location.href = viewGroupUrl()
}

const DataCollection = (key, array) => {
    let result = {}
    let itemCount = array?.length
    array.forEach((obj, index) => {
        Object.keys(obj).forEach(key => {
            let newKey = `${key}|${index + 1}`
            result[newKey] = obj[key]
        })
    })
    result[key] = itemCount.toString()
    return result
}
  
const excludeKeys = (obj, keys) =>
    Object.keys(obj).reduce((result, key) => {
        if (!keys.includes(key)) {
            result[key] = obj[key]
        }
        return result
}, {})
  
const formatDataAPI = data => {
    Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
            data = { ...data, ...DataCollection(key, data[key]) }
        }
    })
    return JSON.stringify(excludeKeys(data, ['FORMID', 'NUMBER']))
}

// main
const main = async () => {
    const newStatus = "Supprimé(e)";

    const document = {
        data: formatDataAPI(docData),
        status: newStatus,
        active: true, // inchangé
        template: { templateId: formLayoutID },
        documentID: FORMID,
    };

    console.log("document", document);

    await api({ local: true })
        .put("document", {
            document,
        })
        .then((res) => {
            console.log("res", res);
        })
        .catch((error) => {
            console.error("Erreur lors de la suppression du volontaire :", error)
        })
};

main();