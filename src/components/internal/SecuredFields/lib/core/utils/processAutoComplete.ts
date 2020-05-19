import postMessageToIframe from './iframes/postMessageToIframe';
import { HOSTED_DATE_FIELD, HOSTED_MONTH_FIELD, HOSTED_YEAR_FIELD } from '../../configuration/constants';
import { SFFeedbackObj, CbObjOnAutoComplete } from '~/components/internal/SecuredFields/lib/types';

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
        const dateValArr: string[] = pFeedbackObj.value.split('/');

        if (dateValArr.length !== 2) return; // To avoid bug in some versions of Safari where date doesn't come through as expected

        if (dateValArr[0].length === 1) dateValArr[0] = `0${dateValArr[0]}`; // pad, if required

        const acMonthVal: string = dateValArr[0];
        const acYearVal: string = dateValArr[1].substr(2); // take last 2 digits of year
        const acDateVal = `${acMonthVal}/${acYearVal}`;

        if (Object.prototype.hasOwnProperty.call(this.state.securedFields, HOSTED_DATE_FIELD)) {
            const dataObj: object = {
                txVariant: this.state.type,
                fieldType: HOSTED_DATE_FIELD,
                autoComplete: acDateVal,
                numKey: this.state.securedFields[HOSTED_DATE_FIELD].numKey
            };
            postMessageToIframe(dataObj, this.getIframeContentWin(HOSTED_DATE_FIELD), this.config.loadingContext);
            return;
        }

        if (Object.prototype.hasOwnProperty.call(this.state.securedFields, HOSTED_MONTH_FIELD)) {
            const dataObj: object = {
                txVariant: this.state.type,
                fieldType: HOSTED_MONTH_FIELD,
                autoComplete: acMonthVal,
                numKey: this.state.securedFields[HOSTED_MONTH_FIELD].numKey
            };
            postMessageToIframe(dataObj, this.getIframeContentWin(HOSTED_MONTH_FIELD), this.config.loadingContext);
        }

        if (Object.prototype.hasOwnProperty.call(this.state.securedFields, HOSTED_YEAR_FIELD)) {
            // Dirty! - Need to wait til next page draw if setting month and year at the same time, otherwise only year gets set
            setTimeout(() => {
                const dataObj: object = {
                    txVariant: this.state.type,
                    fieldType: HOSTED_YEAR_FIELD,
                    autoComplete: acYearVal,
                    numKey: this.state.securedFields[HOSTED_YEAR_FIELD].numKey
                };
                postMessageToIframe(dataObj, this.getIframeContentWin(HOSTED_YEAR_FIELD), this.config.loadingContext);
            }, 0);
        }
    }
}
