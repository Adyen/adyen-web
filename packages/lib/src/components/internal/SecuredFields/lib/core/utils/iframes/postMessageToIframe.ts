const postMessageToIframe = (pDataObj: object, pIframeObj: Window, pLoadingContext: string): void => {
    // Check that an iframe object exists for this fieldType... in some cases the iframe might not exist
    // e.g. bcmc which has no cvc field so e.g. a call to setFocus on the cvc field is not possible
    if (pIframeObj) {
        const dataObjStr: string = JSON.stringify(pDataObj);
        pIframeObj.postMessage(dataObjStr, pLoadingContext);
    }
};

export default postMessageToIframe;
