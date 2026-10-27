console.log('134:', docData);
const {
    Transport_AvecRecurrence,
    Demande_Transport_IdRecurrence
} = docData;



/**
 * Test if a string is a UUID
 * @param {string} str
 * @returns {boolean}
 */
const isUUID = str => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const result = uuidRegex.test(str);
    console.log(`isUUID('${str}') ->`, result);
    return result;
}

/**
 * Get the viewGroup Url
 * @returns {string}
 */
const viewGroupUrl = () => {
    const currentUrl = window.location.href;
    console.log('Current URL:', currentUrl);

    const parts = currentUrl.split('/');
    console.log('URL parts before cleanup:', parts);

    for (let i = 0; i < 3; i++) {
        const lastpart = parts[parts.length - 1];
        if (isUUID(lastpart) || lastpart === 'new') {
            console.log('Removing segment:', lastpart);
            parts.pop();
        }
    }

    const finalUrl = parts.join('/');
    console.log('viewGroupUrl:', finalUrl);
    return finalUrl;
}

// Test Demande_Transport_IdRecurrence
if (Demande_Transport_IdRecurrence) {
    const url = viewGroupUrl() + '/' + Demande_Transport_IdRecurrence;
    console.log('Generated URL for recurrence:', url);
    const result = {
        MarkdownRecurrenceDemande: `Vous modifiez une occurrence. [Modifier la récurrence](${url})`
    };
    console.log('Returning result:', result);
    return result;
}

// Test Transport_AvecRecurrence
if (Transport_AvecRecurrence && Transport_AvecRecurrence === 'true') {
    const result = {
        MarkdownRecurrenceDemande: `Vous modifiez une suite de formulaires`
    };
    console.log('Returning result for recurrence true:', result);
    return result;
}

console.log('No conditions matched, returning nothing.');
