import { CbObjOnAllValid } from '../../types';

const checkFormIsValid = (pSecuredFields: object): boolean => {
    const securedFieldKeys: string[] = Object.keys(pSecuredFields);

    for (let i = 0, len = securedFieldKeys.length; i < len; i += 1) {
        const key: string = securedFieldKeys[i];

        if (!pSecuredFields[key].isValid) {
            return false;
        }
    }
    return true;
};

export function assessFormValidity(): void {
    const isValid: boolean = checkFormIsValid(this.state.securedFields);

    const validityHasChanged: boolean = isValid !== this.state.allValid;

    this.state.allValid = isValid;

    // Only call onAllValid callback if value has changed OR is true
    if (!isValid && !validityHasChanged) return;

    const callbackObj: CbObjOnAllValid = { allValid: isValid, type: this.state.type, rootNode: this.props.rootNode };

    // BROADCAST VALID STATE OF THE FORM AS A WHOLE
    this.callbacks.onAllValid(callbackObj);
}
