import postMessageToIframe from '../utils/iframes/postMessageToIframe';
import { ENCRYPTED_EXPIRY_DATE, ENCRYPTED_EXPIRY_MONTH, ENCRYPTED_EXPIRY_YEAR } from '../../configuration/constants';
import { SFFeedbackObj, CbObjOnAutoComplete } from '../../types';
import { hasOwnProperty } from '../../../../../../utils/hasOwnProperty';
import getIframeContentWin from '../utils/iframes/getIframeContentWin';

/**
 *
 * @param csfState - comes from initial, partial, implementation
 * @param csfConfig - comes from initial, partial, implementation
 * @param csfCallbacks - comes from initial, partial, implementation
 *
 * @param pFeedbackObj -
 */
export function processAutoComplete({ csfState, csfConfig, csfCallbacks }, pFeedbackObj: SFFeedbackObj): void {
    /**
     * NOTE: It seems Chrome has started autofilling across cross-origin iframes. Have tested as far back as v104 but have no resources to test further back
     * So, in theory for Chrome \>= v104 we don't need to do any of this, including having special listeners in the securedFields
     */

    // Specifically for cc-name (but no reason not to propagate all AC objects to the merchant)
    if (pFeedbackObj.name === 'cc-name') {
        const feedbackObj: SFFeedbackObj = { ...pFeedbackObj };
        delete feedbackObj.numKey;
        const ACFeedbackObj: CbObjOnAutoComplete = feedbackObj as CbObjOnAutoComplete;
        csfCallbacks.onAutoComplete(ACFeedbackObj);
    }

    // Send date info to relevant secured fields
    if (pFeedbackObj.name === 'cc-exp') {
        const splittableDateVal = pFeedbackObj.value.replace(/[^0-9]/gi, '/'); // Replace any non-digits with a fwd-slash so we can always split it

        const dateValArr: string[] = splittableDateVal.split('/');

        if (dateValArr.length !== 2) return; // To avoid bug in some versions of Safari where date doesn't come through as expected

        if (dateValArr[0].length === 1) dateValArr[0] = `0${dateValArr[0]}`; // pad, if required

        const acMonthVal: string = dateValArr[0];
        const acYearVal: string = dateValArr[1].substr(2); // take last 2 digits of year
        const acDateVal = `${acMonthVal}/${acYearVal}`;

        if (hasOwnProperty(csfState.securedFields, ENCRYPTED_EXPIRY_DATE)) {
            const dataObj: object = {
                txVariant: csfState.type,
                fieldType: ENCRYPTED_EXPIRY_DATE,
                autoComplete: acDateVal,
                numKey: csfState.securedFields[ENCRYPTED_EXPIRY_DATE].numKey
            };
            postMessageToIframe(dataObj, getIframeContentWin(csfState, ENCRYPTED_EXPIRY_DATE), csfConfig.loadingContext);
            return;
        }

        if (hasOwnProperty(csfState.securedFields, ENCRYPTED_EXPIRY_MONTH)) {
            const dataObj: object = {
                txVariant: csfState.type,
                fieldType: ENCRYPTED_EXPIRY_MONTH,
                autoComplete: acMonthVal,
                numKey: csfState.securedFields[ENCRYPTED_EXPIRY_MONTH].numKey
            };
            postMessageToIframe(dataObj, getIframeContentWin(csfState, ENCRYPTED_EXPIRY_MONTH), csfConfig.loadingContext);
        }

        if (hasOwnProperty(csfState.securedFields, ENCRYPTED_EXPIRY_YEAR)) {
            // Dirty! - Need to wait til next page draw if setting month and year at the same time, otherwise only year gets set
            setTimeout(() => {
                const dataObj: object = {
                    txVariant: csfState.type,
                    fieldType: ENCRYPTED_EXPIRY_YEAR,
                    autoComplete: acYearVal,
                    numKey: csfState.securedFields[ENCRYPTED_EXPIRY_YEAR].numKey
                };
                postMessageToIframe(dataObj, getIframeContentWin(csfState, ENCRYPTED_EXPIRY_YEAR), csfConfig.loadingContext);
            }, 0);
        }
    }
}
