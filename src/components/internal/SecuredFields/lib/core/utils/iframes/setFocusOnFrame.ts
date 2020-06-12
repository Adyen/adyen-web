import { ENCRYPTED_SECURITY_CODE } from '../../../configuration/constants';
import postMessageToIframe from './postMessageToIframe';

export function setFocusOnFrame(pFieldType: string, doLog?: boolean): void {
    // Check destroySecuredFields hasn't been called (thus clearing the state's securedFields object)
    if (!Object.prototype.hasOwnProperty.call(this.state.securedFields, pFieldType)) return;

    if (process.env.NODE_ENV === 'development' && doLog) console.log('\n### setFocusOnFrame:: (SHIFT_TAB) place focus on:', pFieldType);

    // Don't set focus on cvc field if it doesn't exist OR is optional
    if (pFieldType === ENCRYPTED_SECURITY_CODE) {
        if (!Object.prototype.hasOwnProperty.call(this.state.securedFields, pFieldType) || !this.state.securedFields[pFieldType].cvcRequired) {
            return;
        }
    }

    const dataObj: object = {
        txVariant: this.state.type,
        fieldType: pFieldType,
        focus: true,
        numKey: this.state.securedFields[pFieldType].numKey
    };

    postMessageToIframe(dataObj, this.getIframeContentWin(pFieldType), this.config.loadingContext);
}
