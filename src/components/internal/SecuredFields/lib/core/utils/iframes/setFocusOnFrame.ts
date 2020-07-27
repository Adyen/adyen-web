import postMessageToIframe from './postMessageToIframe';

export function setFocusOnFrame(pFieldType: string, doLog?: boolean): void {
    // Check destroySecuredFields hasn't been called (thus clearing the state's securedFields object)
    if (!Object.prototype.hasOwnProperty.call(this.state.securedFields, pFieldType)) return;

    if (process.env.NODE_ENV === 'development' && doLog) console.log('\n### setFocusOnFrame:: (SHIFT_TAB) place focus on:', pFieldType);

    const focusData = {
        txVariant: this.state.type,
        fieldType: pFieldType,
        focus: true,
        numKey: this.state.securedFields[pFieldType].numKey
    };

    postMessageToIframe(focusData, this.getIframeContentWin(pFieldType), this.config.loadingContext);
}
