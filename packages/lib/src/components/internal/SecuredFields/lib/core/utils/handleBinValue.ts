import { SFFeedbackObj, CbObjOnBinValue } from '../../types';

interface DestructuredFeedbackObj {
    binValue?: string;
    encryptedBin?: string;
    uuid?: string;
}

export function handleBinValue(pFeedbackObj: SFFeedbackObj): void {
    const { binValue, encryptedBin, uuid }: DestructuredFeedbackObj = pFeedbackObj;

    const callbacksObj: CbObjOnBinValue = { binValue, type: this.state.type };

    if (encryptedBin) {
        callbacksObj.encryptedBin = encryptedBin;
        callbacksObj.uuid = uuid;
    }

    this.callbacks.onBinValue(callbacksObj);
}
