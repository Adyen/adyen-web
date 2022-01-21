import { CSFStateObject } from '../../types';

/**
 * Retrieves the iframe, stored by field type, & returns it's contentWindow
 */
export default function getIframeContentWin(csfState: CSFStateObject, fieldType: string): Window {
    return csfState.securedFields[fieldType]?.iframeContentWindow || null;
}
