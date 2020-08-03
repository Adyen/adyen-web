import postMessageToIframe from './iframes/postMessageToIframe';
import { ENCRYPTED_EXPIRY_DATE, ENCRYPTED_EXPIRY_MONTH, ENCRYPTED_EXPIRY_YEAR } from '../../configuration/constants';
import { SFFeedbackObj, CbObjOnAutoComplete } from '../../types';

export function processAutoComplete(pFeedbackObj: SFFeedbackObj): void {
    // Specifically for cc-name (but no reason not to propagate all AC objects to the merchant)
    if (pFeedbackObj.name === 'cc-name') {
        const feedbackObj: SFFeedbackObj = { ...pFeedbackObj };
        delete feedbackObj.numKey;
        const ACFeedbackObj: CbObjOnAutoComplete = feedbackObj as CbObjOnAutoComplete;
        this.callbacks.onAutoComplete(ACFeedbackObj);
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

        if (Object.prototype.hasOwnProperty.call(this.state.securedFields, ENCRYPTED_EXPIRY_DATE)) {
            const dataObj: object = {
                txVariant: this.state.type,
                fieldType: ENCRYPTED_EXPIRY_DATE,
                autoComplete: acDateVal,
                numKey: this.state.securedFields[ENCRYPTED_EXPIRY_DATE].numKey
            };
            postMessageToIframe(dataObj, this.getIframeContentWin(ENCRYPTED_EXPIRY_DATE), this.config.loadingContext);
            return;
        }

        if (Object.prototype.hasOwnProperty.call(this.state.securedFields, ENCRYPTED_EXPIRY_MONTH)) {
            const dataObj: object = {
                txVariant: this.state.type,
                fieldType: ENCRYPTED_EXPIRY_MONTH,
                autoComplete: acMonthVal,
                numKey: this.state.securedFields[ENCRYPTED_EXPIRY_MONTH].numKey
            };
            postMessageToIframe(dataObj, this.getIframeContentWin(ENCRYPTED_EXPIRY_MONTH), this.config.loadingContext);
        }

        if (Object.prototype.hasOwnProperty.call(this.state.securedFields, ENCRYPTED_EXPIRY_YEAR)) {
            // Dirty! - Need to wait til next page draw if setting month and year at the same time, otherwise only year gets set
            setTimeout(() => {
                const dataObj: object = {
                    txVariant: this.state.type,
                    fieldType: ENCRYPTED_EXPIRY_YEAR,
                    autoComplete: acYearVal,
                    numKey: this.state.securedFields[ENCRYPTED_EXPIRY_YEAR].numKey
                };
                postMessageToIframe(dataObj, this.getIframeContentWin(ENCRYPTED_EXPIRY_YEAR), this.config.loadingContext);
            }, 0);
        }
    }
}
