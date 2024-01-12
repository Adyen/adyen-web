import postMessageToIframe from '../utils/iframes/postMessageToIframe';
import getIframeContentWin from '../utils/iframes/getIframeContentWin';
import { CSFThisObject } from '../types';
import { SFFieldType } from '../../types';

/**
 * UTIL TO BROADCAST TO ALL IFRAMES AT ONCE
 * Adds correct txVariant, fieldType and numKey for each iframe
 *
 * @param csfState - comes from initial, partial, implementation
 * @param csfConfig  - comes from initial, partial, implementation
 *
 * @param pDataObj -
 */
export function postMessageToAllIframes({ csfState, csfConfig }: CSFThisObject, pDataObj: object): boolean {
    const objKeys: string[] = Object.keys(pDataObj || {});
    if (!objKeys.length) {
        // pDataObj is an object with the 'special' key(s) that represent the reason for making this postMessage
        // without it/them there is no reason to postMessage
        return false;
    }

    const securedFieldKeys: string[] = Object.keys(csfState.securedFields);
    securedFieldKeys.forEach((pFieldType: SFFieldType) => {
        const dataObj: object = {
            txVariant: csfState.type,
            fieldType: pFieldType,
            numKey: csfState.securedFields[pFieldType].numKey
        };

        // Copy across 'special' properties from passed data object
        objKeys.forEach(pKey => {
            dataObj[pKey] = pDataObj[pKey];
        });

        postMessageToIframe(dataObj, getIframeContentWin(csfState, pFieldType), csfConfig.loadingContext);
    });
    return true;
}
