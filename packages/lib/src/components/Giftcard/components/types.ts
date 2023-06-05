import Language from '../../../language/Language';
import { SFPState } from '../../internal/SecuredFields/SFP/types';

export type GiftcardFieldsProps = {
    setRootNode: (input: HTMLElement) => void;
    i18n: Language;
    pinRequired: boolean;
    sfpState: SFPState;
    getCardErrorMessage;
    focusedElement;
    setFocusOn;
    label?: string;
};

export type GiftcardFieldProps = {
    i18n: Language;
    classNameModifiers?: Array<string>;
    sfpState: any;
    getCardErrorMessage;
    focusedElement;
    setFocusOn;
    label?: string;
};
