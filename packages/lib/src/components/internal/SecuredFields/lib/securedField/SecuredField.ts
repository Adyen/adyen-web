import * as logger from '../utilities/logger';
import createIframe from './utils/createIframe';
import { selectOne, on, off, removeAllChildren } from '../utilities/dom';
import postMessageToIframe from '../CSF/utils/iframes/postMessageToIframe';
import { isWebpackPostMsg, originCheckPassed, isChromeVoxPostMsg } from '../CSF/utils/iframes/postMessageValidation';
import {
    CVC_POLICY_HIDDEN,
    CVC_POLICY_OPTIONAL,
    ENCRYPTED_SECURITY_CODE,
    ENCRYPTED_EXPIRY_DATE,
    DATE_POLICY_HIDDEN,
    DATE_POLICY_OPTIONAL,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR
} from '../configuration/constants';
import { generateRandomNumber } from '../utilities/commonUtils';
import { SFFeedbackObj } from '../types';
import AbstractSecuredField, { SFSetupObject, IframeConfigObject, AriaConfig, SFPlaceholdersObject, SFInternalConfig } from './AbstractSecuredField';
import { CVCPolicyType, DatePolicyType, RtnType_noParamVoidFn, RtnType_postMessageListener, RtnType_callbackFn } from '../types';
import { pick, reject } from '../../utils';
import { processAriaConfig } from './utils/processAriaConfig';
import { processPlaceholders } from './utils/processPlaceholders';
import Language from '../../../../../language/Language';
import { hasOwnProperty } from '../../../../../utils/hasOwnProperty';

const logPostMsg = false;
const doLog = false;

class SecuredField extends AbstractSecuredField {
    // --
    constructor(pSetupObj: SFSetupObject, i18n: Language) {
        super();

        // List of props from setup object not required, or not directly required (e.g. cvcPolicy), in the iframe config object
        const deltaPropsArr: string[] = ['fieldType', 'iframeSrc', 'cvcPolicy', 'expiryDatePolicy', 'loadingContext', 'holderEl'];

        // Copy passed setup object values to this.config...
        const configVarsFromSetUpObj = reject(deltaPropsArr).from(pSetupObj);

        // ...breaking references on iframeUIConfig object so we can overwrite its properties in each securedField instance
        this.config = { ...this.config, ...configVarsFromSetUpObj, iframeUIConfig: { ...configVarsFromSetUpObj.iframeUIConfig } } as SFInternalConfig;

        // Copy passed setup object values to this
        const thisVarsFromSetupObj = pick(deltaPropsArr).from(pSetupObj);

        this.fieldType = thisVarsFromSetupObj.fieldType;
        this.cvcPolicy = thisVarsFromSetupObj.cvcPolicy;
        this.expiryDatePolicy = thisVarsFromSetupObj.expiryDatePolicy;
        this.iframeSrc = thisVarsFromSetupObj.iframeSrc;
        this.loadingContext = thisVarsFromSetupObj.loadingContext;
        this.holderEl = thisVarsFromSetupObj.holderEl;

        // Initiate values through setters
        this.isValid = false;
        this.iframeContentWindow = null;
        this.numKey = generateRandomNumber();
        this.isEncrypted = false;
        this.hasError = false;
        this.errorType = '';

        if (process.env.NODE_ENV === 'development' && doLog) {
            logger.log('### SecuredField::constructor:: this.fieldType=', this.fieldType, 'isValid=', this._isValid, 'numKey=', this.numKey);
            logger.log('\n');
        }

        return this.init(i18n);
    }

    init(i18n: Language): SecuredField {
        /**
         * Ensure all fields have a related ariaConfig object containing, at minimum, an iframeTitle property and a (translated) errors object
         */
        const processedAriaConfig: AriaConfig = processAriaConfig(this.config, this.fieldType, i18n);
        // Set result back onto config object
        this.config.iframeUIConfig.ariaConfig = processedAriaConfig;

        /**
         * Ensure that if a placeholder hasn't been set for a field then it gets a default, translated, one
         */
        const processedPlaceholders: SFPlaceholdersObject = processPlaceholders(this.config, this.fieldType, i18n);
        // Set result back onto config object
        this.config.iframeUIConfig.placeholders = processedPlaceholders;

        /**
         * Configure, create & reference iframe and add load listener
         */
        const iframeConfig = {
            src: this.iframeSrc,
            title: processedAriaConfig[this.fieldType].iframeTitle,
            policy: 'origin'
        };

        const iframeEl: HTMLIFrameElement = createIframe(iframeConfig);

        // Place the iframe into the holder
        this.holderEl.appendChild(iframeEl);

        // Now examine the holder to get an actual DOM node
        const iframe: HTMLIFrameElement = selectOne(this.holderEl, '.js-iframe');

        if (iframe) {
            this.iframeContentWindow = iframe.contentWindow;

            // Create reference to bound fn (see getters/setters for binding)
            this.iframeOnLoadListener = this.iframeOnLoadListenerFn;

            on(iframe, 'load', this.iframeOnLoadListener, false);
        }

        return this;
    }

    iframeOnLoadListenerFn(): void {
        off(window, 'load', this.iframeOnLoadListener, false);

        // Create reference to bound fn (see getters/setters for binding)
        this.postMessageListener = this.postMessageListenerFn;

        // Add general listener for 'message' EVENT - the event that 'powers' postMessage
        on(window, 'message', this.postMessageListener, false);

        // Create and send config object to iframe
        const configObj: IframeConfigObject = {
            fieldType: this.fieldType,
            cvcPolicy: this.cvcPolicy,
            expiryDatePolicy: this.expiryDatePolicy,
            numKey: this.numKey,
            txVariant: this.config.txVariant,
            extraFieldData: this.config.extraFieldData,
            cardGroupTypes: this.config.cardGroupTypes,
            iframeUIConfig: this.config.iframeUIConfig,
            sfLogAtStart: this.config.sfLogAtStart,
            showWarnings: this.config.showWarnings,
            trimTrailingSeparator: this.config.trimTrailingSeparator,
            isCreditCardType: this.config.isCreditCardType,
            legacyInputMode: this.config.legacyInputMode,
            minimumExpiryDate: this.config.minimumExpiryDate,
            uid: this.config.uid,
            implementationType: this.config.implementationType,
            bundleType: this.config.bundleType,
            isCollatingErrors: this.config.isCollatingErrors
        };

        if (window._b$dl) console.log('### SecuredField:::: onIframeLoaded:: created configObj=', configObj);

        postMessageToIframe(configObj, this.iframeContentWindow, this.loadingContext);
        //--

        // Callback to say iframe loaded
        this.onIframeLoadedCallback();
    }

    postMessageListenerFn(event: MessageEvent): void {
        // Check message is from expected domain
        if (!originCheckPassed(event, this.loadingContext, this.config.showWarnings)) {
            return;
        }

        // TODO - for debugging purposes this would always be useful to see
        //        logger.log('\n',this.fieldType,'### CSF SecuredField::postMessageListener:: event.data=',event.data);

        if (process.env.NODE_ENV === 'development' && logPostMsg) {
            logger.log(
                '\n###CSF SecuredField::postMessageListener:: DOMAIN & ORIGIN MATCH, NO WEBPACK WEIRDNESS fieldType=',
                this.fieldType,
                'txVariant=',
                this.config.txVariant,
                'this.numKey=',
                this.numKey
            );
        }

        // PARSE DATA OBJECT (thus testing if it is a JSON string) - OR TRY & WORK OUT WHY THE PARSING FAILED
        let feedbackObj: SFFeedbackObj;

        try {
            feedbackObj = JSON.parse(event.data);
        } catch (e) {
            // Was the message generated by webpack?
            if (isWebpackPostMsg(event)) {
                if (this.config.showWarnings) logger.log('### SecuredField::postMessageListenerFn:: PARSE FAIL - WEBPACK');
                return;
            }

            // Was the message generated by ChromeVox?
            if (isChromeVoxPostMsg(event)) {
                if (this.config.showWarnings) logger.log('### SecuredField::postMessageListenerFn:: PARSE FAIL - CHROMEVOX');
                return;
            }

            if (this.config.showWarnings)
                logger.log('### SecuredField::postMessageListenerFn:: PARSE FAIL - UNKNOWN REASON: event.data=', event.data);
            return;
        }

        // CHECK FOR EXPECTED PROPS
        const hasMainProps: boolean = hasOwnProperty(feedbackObj, 'action') && hasOwnProperty(feedbackObj, 'numKey');

        if (!hasMainProps) {
            if (this.config.showWarnings) logger.warn('WARNING SecuredField :: postMessage listener for iframe :: data mismatch!');
            return;
        }

        if (process.env.NODE_ENV === 'development' && logPostMsg) {
            logger.log('### SecuredField::postMessageListener:: feedbackObj.numKey=', feedbackObj.numKey);
        }

        if (this.numKey !== feedbackObj.numKey) {
            if (this.config.showWarnings) {
                logger.warn(
                    'WARNING SecuredField :: postMessage listener for iframe :: data mismatch! ' +
                        '(Probably a message from an unrelated securedField)'
                );
            }
            return;
        }

        // VALIDATION CHECKS PASSED - DECIDE ON COURSE OF ACTION
        if (process.env.NODE_ENV === 'development' && logPostMsg) {
            logger.log(
                '### SecuredField::postMessageListener:: numkeys match PROCEED WITH POST MESSAGE PROCESSING fieldType=',
                this.fieldType,
                'txVariant=',
                this.config.txVariant
            );
        }

        switch (feedbackObj.action) {
            case 'encryption':
                this.isValid = true;
                this.onEncryptionCallback(feedbackObj);
                break;

            case 'config':
                if (window._b$dl)
                    console.log('### SecuredField::postMessageListenerFn:: configured - calling onConfigCallback', feedbackObj.fieldType);
                this.onConfigCallback(feedbackObj);
                break;

            case 'focus':
                this.onFocusCallback(feedbackObj);

                // HORRIBLE HORRIBLE HACK to get round bug in TestCafe - see comment on 3rd test in packages/e2e/tests/cards/branding/branding.test.js
                if (process.env.NODE_ENV === 'development' && window.location.origin.indexOf('3024') > -1) {
                    if (window['testCafeForceClick'] === true) {
                        window['testCafeForceClick'] = false;
                        this.onTouchstartCallback(feedbackObj);
                    }
                }
                break;

            case 'binValue':
                this.onBinValueCallback(feedbackObj);
                break;

            // iOS ONLY - RE. iOS BUGS AROUND BLUR AND FOCUS EVENTS
            case 'touch':
                this.onTouchstartCallback(feedbackObj);
                break;

            // Only happens for Firefox & IE <= 11
            case 'shifttab':
                this.onShiftTabCallback(feedbackObj);
                break;

            case 'autoComplete':
                this.onAutoCompleteCallback(feedbackObj);
                break;

            /**
             * Validate, because action =
             *
             *  'brand'
             *  'delete'
             *  'luhnCheck'
             *  'incomplete field' (an error that follows from a focus (blur) event)
             *  'numberKeyPressed' (or date-, month-, year-, cvc-, pin-, or iban- KeyPressed)
             *    - since we have no "error" action "...KeyPressed" is the action type on most error events (other than "incomplete field" or "luhnCheck")
             *    and often these error events representing the clearing of an existing error
             */
            default:
                // If we're validation handling (& not encryption handling) field must be invalid
                this.isValid = false;
                this.onValidationCallback(feedbackObj);
        }
    }

    destroy(): void {
        off(window, 'message', this.postMessageListener, false);
        this.iframeContentWindow = null;
        removeAllChildren(this.holderEl);
    }

    /**
     * Returns whether the securedField is hidden OR whether it is optional and not in error
     */
    isOptionalOrHidden(): boolean {
        if (this.fieldType === ENCRYPTED_EXPIRY_DATE || this.fieldType === ENCRYPTED_EXPIRY_MONTH || this.fieldType === ENCRYPTED_EXPIRY_YEAR) {
            switch (this.expiryDatePolicy) {
                case DATE_POLICY_HIDDEN:
                    return true;
                case DATE_POLICY_OPTIONAL:
                    return !this.hasError;
                default:
                    return false;
            }
        }

        if (this.fieldType === ENCRYPTED_SECURITY_CODE) {
            switch (this.cvcPolicy) {
                case CVC_POLICY_HIDDEN:
                    return true;
                case CVC_POLICY_OPTIONAL:
                    return !this.hasError;
                default:
                    return false;
            }
        }

        // Any other type of securedField is not optional & can't be hidden
        return false;
    }

    // /////// ALLOCATE CALLBACKS /////////
    onIframeLoaded(callbackFn: RtnType_noParamVoidFn): SecuredField {
        this.onIframeLoadedCallback = callbackFn;
        return this;
    }

    onEncryption(callbackFn: RtnType_callbackFn): SecuredField {
        this.onEncryptionCallback = callbackFn;
        return this;
    }

    onValidation(callbackFn: RtnType_callbackFn): SecuredField {
        this.onValidationCallback = callbackFn;
        return this;
    }

    onConfig(callbackFn: RtnType_callbackFn): SecuredField {
        this.onConfigCallback = callbackFn;
        return this;
    }

    onFocus(callbackFn: RtnType_callbackFn): SecuredField {
        this.onFocusCallback = callbackFn;
        return this;
    }

    onBinValue(callbackFn: RtnType_callbackFn): SecuredField {
        this.onBinValueCallback = callbackFn;
        return this;
    }

    onTouchstart(callbackFn: RtnType_callbackFn): SecuredField {
        this.onTouchstartCallback = callbackFn;
        return this;
    }

    onShiftTab(callbackFn: RtnType_callbackFn): SecuredField {
        this.onShiftTabCallback = callbackFn;
        return this;
    }

    onAutoComplete(callbackFn: RtnType_callbackFn): SecuredField {
        this.onAutoCompleteCallback = callbackFn;
        return this;
    }
    //------------------------------------

    // ///////////// GETTERS/SETTERS //////////////

    get errorType(): string {
        return this._errorType;
    }
    set errorType(value: string) {
        this._errorType = value;
    }

    get hasError(): boolean {
        return this._hasError;
    }
    set hasError(value: boolean) {
        this._hasError = value;
    }

    get isValid(): boolean {
        if (this.fieldType === ENCRYPTED_SECURITY_CODE) {
            switch (this.cvcPolicy) {
                case CVC_POLICY_HIDDEN:
                    // If cvc is hidden then the field is always valid
                    return true;
                case CVC_POLICY_OPTIONAL:
                    // If cvc is optional then the field is always valid UNLESS it has an error
                    return !this.hasError;
                default:
                    return this._isValid;
            }
        }

        if (this.fieldType === ENCRYPTED_EXPIRY_DATE || this.fieldType === ENCRYPTED_EXPIRY_MONTH || this.fieldType === ENCRYPTED_EXPIRY_YEAR) {
            switch (this.expiryDatePolicy) {
                case DATE_POLICY_HIDDEN:
                    // If date is hidden then the field is always valid
                    return true;
                case DATE_POLICY_OPTIONAL:
                    // If date is optional then the field is always valid UNLESS it has an error
                    return !this.hasError;
                default:
                    return this._isValid;
            }
        }

        return this._isValid;
    }
    set isValid(value: boolean) {
        this._isValid = value;
    }

    get cvcPolicy(): CVCPolicyType {
        return this._cvcPolicy;
    }

    set cvcPolicy(value: CVCPolicyType) {
        // Only set if this is a CVC field
        if (this.fieldType !== ENCRYPTED_SECURITY_CODE) return;

        // Only set if value has changed
        if (value === this.cvcPolicy) return;

        if (process.env.NODE_ENV === 'development' && doLog) logger.log(this.fieldType, '### SecuredField::cvcPolicy:: value=', value);

        this._cvcPolicy = value;

        // If the field has changed status (required <--> not required) AND it's error state was due to an isValidated call
        // NOTE: fixes issue in Components where you first validate and then start typing a maestro number
        // - w/o this and the fix in CSF the maestro PM will never register as valid
        if (this.hasError && this.errorType === 'isValidated') {
            this.hasError = false;
        }
    }

    get expiryDatePolicy(): DatePolicyType {
        return this._expiryDatePolicy;
    }

    set expiryDatePolicy(value: DatePolicyType) {
        // Only set if this is a date field type of securedField
        if (this.fieldType !== ENCRYPTED_EXPIRY_DATE && this.fieldType !== ENCRYPTED_EXPIRY_MONTH && this.fieldType !== ENCRYPTED_EXPIRY_YEAR) return;

        // Only set if value has changed
        if (value === this.expiryDatePolicy) return;

        if (process.env.NODE_ENV === 'development' && doLog) logger.log(this.fieldType, '### SecuredField:expiryDatePolicy:: value=', value);

        this._expiryDatePolicy = value;

        // If the field has changed status (required <--> not required) AND it's error state was due to an isValidated call
        if (this.hasError && this.errorType === 'isValidated') {
            this.hasError = false;
        }
    }

    get iframeContentWindow(): Window {
        return this._iframeContentWindow;
    }
    set iframeContentWindow(value: Window) {
        this._iframeContentWindow = value;
    }

    get isEncrypted(): boolean {
        return this._isEncrypted;
    }
    set isEncrypted(value: boolean) {
        this._isEncrypted = value;
    }

    get numKey(): number {
        return this._numKey;
    }
    set numKey(value: number) {
        this._numKey = value;
    }

    // Internal use - way to create listener refs that we can add/remove
    get iframeOnLoadListener(): RtnType_noParamVoidFn {
        return this._iframeOnLoadListener;
    }
    set iframeOnLoadListener(value: RtnType_noParamVoidFn) {
        this._iframeOnLoadListener = value.bind(this);
    }

    get postMessageListener(): RtnType_postMessageListener {
        return this._postMessageListener;
    }
    set postMessageListener(value: RtnType_postMessageListener) {
        this._postMessageListener = value.bind(this);
    }
}

export default SecuredField;
