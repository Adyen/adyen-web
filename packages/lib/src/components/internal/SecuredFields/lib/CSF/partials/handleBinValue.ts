import { SFFeedbackObj, CbObjOnBinValue } from '../../types';
import { CSFThisObject } from '../types';

interface DestructuredFeedbackObj {
    binValue?: string;
    encryptedBin?: string;
    uuid?: string;
}

/**
 * @param csfState - comes from initial, partial, implementation
 * @param csfCallbacks - comes from initial, partial, implementation
 *
 * @param pFeedbackObj -
 */
export function handleBinValue({ csfState, csfCallbacks }: CSFThisObject, pFeedbackObj: SFFeedbackObj): void {
    const { binValue, encryptedBin, uuid }: DestructuredFeedbackObj = pFeedbackObj;

    const callbacksObj: CbObjOnBinValue = { binValue, type: csfState.type };

    if (encryptedBin) {
        callbacksObj.encryptedBin = encryptedBin;
        callbacksObj.uuid = uuid;
    }

    csfCallbacks.onBinValue(callbacksObj);
}
