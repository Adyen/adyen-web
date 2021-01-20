import { SetupObject, ConfigObject, CallbacksConfig, CSFStateObject, SFFeedbackObj, SendBrandObject } from '../types';
import { createSecuredFields } from './createSecuredFields';
import { handleProcessBrand } from './utils/processBrand';
import { handleBrandFromBinLookup } from './utils/handleBrandFromBinLookup';

abstract class AbstractCSF {
    // Set in CSF
    protected callbacks: CallbacksConfig;
    protected config: ConfigObject;
    protected props: SetupObject;
    protected state: CSFStateObject;
    protected assessFormValidity: () => void;
    protected brandsFromBinLookup: typeof handleBrandFromBinLookup;
    protected callbacksHandler: (callbacksObj: object) => void;
    protected configHandler: () => void;
    protected createCardSecuredFields: (securedFields: HTMLElement[]) => number;
    protected createNonCardSecuredFields: (securedFields: HTMLElement[]) => number;
    protected createSecuredFields: typeof createSecuredFields;
    protected destroySecuredFields: () => void;
    protected destroyTouchendListener: () => void;
    protected handleAdditionalFields: () => void;
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
    protected processBrand: typeof handleProcessBrand;
    protected sendBrandToCardSF: (brandObj: SendBrandObject) => void;
    protected setFocusOnFrame: (pFieldType: string, doLog?: boolean) => void;
    protected setupSecuredField: (pItem: HTMLElement) => void;
    protected touchendListener: (e: Event) => void;
    // Set in createSecuredFields
    protected encryptedAttrName: string;
    protected hasRedundantCVCField: boolean;
    protected hideCVC: boolean;
    protected isSingleBrandedCard: boolean;
    protected securityCode: string;
    // --
    protected constructor(setupObj: SetupObject) {
        this.props = setupObj;
        this.state = ({} as any) as CSFStateObject;

        // Initialise storage objects
        this.config = ({} as any) as ConfigObject; // {} as ConfigObject fails in linting
        this.callbacks = ({} as any) as CallbacksConfig;
    }
}
export default AbstractCSF;
