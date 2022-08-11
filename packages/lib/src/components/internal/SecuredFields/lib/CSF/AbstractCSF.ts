import { CSFSetupObject, CSFConfigObject, CSFCallbacksConfig, CSFStateObject } from './types';
import { SFFeedbackObj, SendBrandObject, SendExpiryDateObject } from '../types';
import { createSecuredFields } from './extensions/createSecuredFields';
import processBrand from './partials/processBrand';
import handleBrandFromBinLookup from './extensions/handleBrandFromBinLookup';

abstract class AbstractCSF {
    // Set in CSF
    protected callbacks: CSFCallbacksConfig;
    protected config: CSFConfigObject;
    protected props: CSFSetupObject;
    protected state: CSFStateObject;
    protected validateForm: () => void;
    protected handleBrandFromBinLookup: typeof handleBrandFromBinLookup;
    protected callbacksHandler: (callbacksObj: object) => void;
    protected configHandler: () => void;
    protected createCardSecuredFields: (securedFields: HTMLElement[]) => Promise<any>;
    protected createNonCardSecuredFields: (securedFields: HTMLElement[]) => Promise<any>;
    protected createSecuredFields: typeof createSecuredFields;
    protected destroySecuredFields: () => void;
    protected handleIOSTouchEvents: () => void;
    protected destroyTouchendListener: () => void;
    protected destroyTouchstartListener: () => void;
    protected handleBinValue: (pFeedbackObj: SFFeedbackObj) => void;
    protected handleEncryption: (pFeedbackObj: SFFeedbackObj) => void;
    protected handleFocus: (pFeedbackObj: SFFeedbackObj) => void;
    protected handleIframeConfigFeedback: (pFeedbackObj) => boolean;
    protected handleValidation: (pFeedbackObj: SFFeedbackObj) => void;
    protected handleSFShiftTab: (fieldType: string) => void;
    protected handleShiftTab: (fieldType: string) => void;
    protected isConfigured: () => void;
    protected postMessageToAllIframes: (pDataObj: object) => void;
    protected processAutoComplete: (pFeedbackObj: SFFeedbackObj) => void;
    protected processBrand: typeof processBrand;
    protected sendBrandToCardSF: (brandObj: SendBrandObject) => void;
    protected sendExpiryDatePolicyToSF: (dateObj: SendExpiryDateObject) => void;
    protected setFocusOnFrame: (pFieldType: string, doLog?: boolean) => void;
    protected setupSecuredField: (pItem: HTMLElement) => void;
    protected touchendListener: (e: Event) => void;
    protected touchstartListener: () => void;
    // Set in createSecuredFields
    protected encryptedAttrName: string;
    protected hasRedundantCVCField: boolean;
    protected isSingleBrandedCard: boolean;
    protected securityCode: string;
    // --
    protected constructor(setupObj: CSFSetupObject) {
        this.props = setupObj;
        this.state = ({} as any) as CSFStateObject;

        // Initialise storage objects
        this.config = ({} as any) as CSFConfigObject; // {} as ConfigObject fails in linting
        this.callbacks = ({} as any) as CSFCallbacksConfig;
    }
}
export default AbstractCSF;
