import postMessageToIframe from './postMessageToIframe';

// UTIL TO BROADCAST TO ALL IFRAMES AT ONCE
// Adds correct txVariant, fieldType and numKey for each iframe
export function postMessageToAllIframes(pDataObj: object): void {
    const objKeys: string[] = Object.keys(pDataObj || {});
    if (!objKeys.length) {
        // pDataObj is an object with the 'special' key(s) that represent the reason for making this postMessage
        // without it/them there is no reason to postMessage
        return;
    }

    const securedFieldKeys: string[] = Object.keys(this.state.securedFields);
    securedFieldKeys.forEach(pFieldType => {
        const dataObj: object = {
            txVariant: this.state.type,
            fieldType: pFieldType,
            numKey: this.state.securedFields[pFieldType].numKey
        };

        // Copy across 'special' properties from passed data object
        objKeys.forEach(pKey => {
            dataObj[pKey] = pDataObj[pKey];
        });

        postMessageToIframe(dataObj, this.getIframeContentWin(pFieldType), this.config.loadingContext);
    });
}
