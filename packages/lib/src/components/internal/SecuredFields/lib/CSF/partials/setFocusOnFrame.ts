import postMessageToIframe from '../utils/iframes/postMessageToIframe';
import { hasOwnProperty } from '../../../../../../utils/hasOwnProperty';
import getIframeContentWin from '../utils/iframes/getIframeContentWin';
import { SFFieldType } from '../../types';
import { CSFThisObject } from '../types';

/**
 * @param csfState - comes from initial, partial, implementation
 * @param csfConfig - comes from initial, partial, implementation
 *
 * @param pFieldType -
 * @param doLog -
 */
export function setFocusOnFrame({ csfState, csfConfig }: CSFThisObject, pFieldType: SFFieldType, doLog?: boolean): void {
    // Check destroySecuredFields hasn't been called (thus clearing the state's securedFields object)
    if (!hasOwnProperty(csfState.securedFields, pFieldType)) return;

    if (process.env.NODE_ENV === 'development' && doLog) console.log('\n### setFocusOnFrame:: (SHIFT_TAB) place focus on:', pFieldType);

    const focusData = {
        txVariant: csfState.type,
        fieldType: pFieldType,
        focus: true,
        numKey: csfState.securedFields[pFieldType].numKey
    };

    postMessageToIframe(focusData, getIframeContentWin(csfState, pFieldType), csfConfig.loadingContext);
}
