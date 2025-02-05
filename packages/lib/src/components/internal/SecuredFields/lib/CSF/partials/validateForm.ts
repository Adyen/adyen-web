import { CardAllValidData, SecuredFields } from '../../types';
import { CSFThisObject } from '../types';

const checkFormIsValid = (pSecuredFields: SecuredFields): boolean => {
    const securedFieldKeys: string[] = Object.keys(pSecuredFields);

    for (let i = 0, len = securedFieldKeys.length; i < len; i += 1) {
        const key: string = securedFieldKeys[i];

        if (!pSecuredFields[key].isValid) {
            return false;
        }
    }
    return true;
};

/**
 * @param csfState - comes from initial, partial, implementation
 * @param csfProps - comes from initial, partial, implementation
 * @param csfCallbacks - comes from initial, partial, implementation
 */
export default function validateForm({ csfState, csfProps, csfCallbacks }: CSFThisObject): void {
    const isValid: boolean = checkFormIsValid(csfState.securedFields);

    const validityHasChanged: boolean = isValid !== csfState.allValid;

    csfState.allValid = isValid;

    // Only call onAllValid callback if value has changed OR is true
    if (!isValid && !validityHasChanged) return;

    const callbackObj: CardAllValidData = { allValid: isValid, type: csfState.type, rootNode: csfProps.rootNode as HTMLElement };

    // BROADCAST VALID STATE OF THE FORM AS A WHOLE
    csfCallbacks.onAllValid(callbackObj);
}
