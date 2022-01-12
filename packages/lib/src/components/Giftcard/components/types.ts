import Language from '../../../language/Language';

export type GiftcardFieldsProps = {
    setRootNode: (input: HTMLElement) => void;
    i18n: Language;
    pinRequired: boolean;
    sfpState: any; //TODO
    getCardErrorMessage;
    focusedElement;
    setFocusOn;
};

export type GiftcardFieldProps = {
    i18n: Language;
    classNameModifiers: Array<string>;
    sfpState: any;
    getCardErrorMessage;
    focusedElement;
    setFocusOn;
};
