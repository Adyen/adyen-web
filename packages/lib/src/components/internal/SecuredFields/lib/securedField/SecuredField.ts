import * as logger from '../utilities/logger';
import createIframe from './utils/createIframe';
import { removeAllChildren, selectOne } from '../utilities/dom';
import { off, on } from '../../../../../utils/listenerUtils';
import postMessageToIframe from '../CSF/utils/iframes/postMessageToIframe';
import { isChromeVoxPostMsg, isWebpackPostMsg, originCheckPassed } from '../CSF/utils/iframes/postMessageValidation';
import {
    CVC_POLICY_HIDDEN,
    CVC_POLICY_OPTIONAL,
    DATE_POLICY_HIDDEN,
    DATE_POLICY_OPTIONAL,
    ENCRYPTED_EXPIRY_DATE,
    ENCRYPTED_EXPIRY_MONTH,
    ENCRYPTED_EXPIRY_YEAR,
    ENCRYPTED_SECURITY_CODE
} from '../constants';
import { generateRandomNumber } from '../utilities/commonUtils';
import { CVCPolicyType, DatePolicyType, RtnType_callbackFn, RtnType_noParamVoidFn, RtnType_postMessageListener, SFFeedbackObj } from '../types';
import AbstractSecuredField from './AbstractSecuredField';
import { AriaConfig, IframeConfigObject, SecuredFieldSetupObject, SecuredFieldCommonProps } from '../types';
import { reject } from '../../../../../utils/commonUtils';
import { processAriaConfig } from './utils/processAriaConfig';
import { processPlaceholders } from './utils/processPlaceholders';
import Language from '../../../../../language/Language';
import { hasOwnProperty } from '../../../../../utils/hasOwnProperty';
import { Placeholders } from '../../SFP/types';
import './SecuredField.scss';

const logPostMsg = false;
const doLog = false;

class SecuredField extends AbstractSecuredField {
    constructor(pSetupObj: SecuredFieldSetupObject, i18n: Language) {
        super();

        /**
         * List of props to exclude from being set on this.sfConfig.
         * These props are only required for internal purposes. They do not get sent to the iframe
         */
        const deltaPropsArr: string[] = ['loadingContext', 'holderEl', 'iframeSrc', 'showContextualElement', 'placeholders'];

        /**
         * List of props from setup object that will be set on this.sfConfig
         * These props will all end up being sent to the iframe
         */
        const configVarsFromSetUpObj = reject(deltaPropsArr).from(pSetupObj);

        // Copy passed setup object values to this.sfConfig
        this.sfConfig = {
            // ...this.sfConfig, // Do we need to do this? Pretty sure we don't
            ...configVarsFromSetUpObj,
            // Break references on iframeUIConfig object so we can overwrite its properties in each securedField instance
            iframeUIConfig: { ...configVarsFromSetUpObj.iframeUIConfig }
        } as SecuredFieldCommonProps;

        /**
         * Extract values only needed for init
         */
        const { iframeSrc, placeholders, showContextualElement } = pSetupObj;

        /**
         * Store those passed setup object values that are needed in multiple functions
         */
        this.loadingContext = pSetupObj.loadingContext;
        this.holderEl = pSetupObj.holderEl;

        /**
         * Initiate other values on 'this' through setters
         */
        this.isValid = false;
        this.iframeContentWindow = null;
        this.numKey = generateRandomNumber();
        this.isEncrypted = false;
        this.hasError = false;
        this.errorType = '';
        this.cvcPolicy = pSetupObj.cvcPolicy;
        this.expiryDatePolicy = pSetupObj.expiryDatePolicy;

        if (process.env.NODE_ENV === 'development' && doLog) {
            logger.log(
                '### SecuredField::constructor:: this.sfConfig.fieldType=',
                this.sfConfig.fieldType,
                'isValid=',
                this._isValid,
                'numKey=',
                this.numKey
            );
            logger.log('\n');
        }

        return this.init(i18n, iframeSrc, placeholders, showContextualElement);
    }

    init(i18n: Language, iframeSrc: string, placeholders: Placeholders, showContextualElement: boolean): SecuredField {
        /**
         * Ensure all fields have a related ariaConfig object containing, at minimum, an iframeTitle property and a (translated) errors object
         */
        const processedAriaConfig: AriaConfig = processAriaConfig(this.sfConfig.txVariant, this.sfConfig.fieldType, i18n, showContextualElement);
        // Set result back onto config object
        this.sfConfig.iframeUIConfig.ariaConfig = processedAriaConfig;

        // Set result back onto config object
        this.sfConfig.iframeUIConfig.placeholders = processPlaceholders(this.sfConfig.txVariant, this.sfConfig.fieldType, placeholders);

        /**
         * Configure, create & reference iframe and add load listener
         */
        const iframeConfig = {
            src: iframeSrc,
            title: processedAriaConfig[this.sfConfig.fieldType].iframeTitle,
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

        this.iframeRef = iframe;

        return this;
    }

    iframeOnLoadListenerFn(): void {
        // Create reference to bound fn (see getters/setters for binding)
        this.postMessageListener = this.postMessageListenerFn;

        // Add general listener for 'message' EVENT - the event that 'powers' postMessage
        on(window, 'message', this.postMessageListener, false);

        // Create and send config object to iframe
        const configObj: IframeConfigObject = {
            ...this.sfConfig,
            numKey: this.numKey
        };

        if (window._b$dl) console.log('### SecuredField:::: onIframeLoaded:: created configObj=', configObj);

        postMessageToIframe(configObj, this.iframeContentWindow, this.loadingContext);
        //--

        // Callback to say iframe loaded
        this.onIframeLoadedCallback();
    }

    postMessageListenerFn(event: MessageEvent): void {
        // Check message is from expected domain
        if (!originCheckPassed(event, this.loadingContext, this.sfConfig.showWarnings)) {
            return;
        }

        // TODO - for debugging purposes this would always be useful to see
        //        logger.log('\n',this.sfConfig.fieldType,'### CSF SecuredField::postMessageListener:: event.data=',event.data);

        if (process.env.NODE_ENV === 'development' && logPostMsg) {
            logger.log(
                '\n###CSF SecuredField::postMessageListener:: DOMAIN & ORIGIN MATCH, NO WEBPACK WEIRDNESS fieldType=',
                this.sfConfig.fieldType,
                'txVariant=',
                this.sfConfig.txVariant,
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
                if (this.sfConfig.showWarnings) logger.log('### SecuredField::postMessageListenerFn:: PARSE FAIL - WEBPACK');
                return;
            }

            // Was the message generated by ChromeVox?
            if (isChromeVoxPostMsg(event)) {
                if (this.sfConfig.showWarnings) logger.log('### SecuredField::postMessageListenerFn:: PARSE FAIL - CHROMEVOX');
                return;
            }

            if (this.sfConfig.showWarnings)
                logger.log('### SecuredField::postMessageListenerFn:: PARSE FAIL - UNKNOWN REASON: event.data=', event.data);
            return;
        }

        // CHECK FOR EXPECTED PROPS
        const hasMainProps: boolean = hasOwnProperty(feedbackObj, 'action') && hasOwnProperty(feedbackObj, 'numKey');

        if (!hasMainProps) {
            if (this.sfConfig.showWarnings) logger.warn('WARNING SecuredField :: postMessage listener for iframe :: data mismatch!');
            return;
        }

        if (process.env.NODE_ENV === 'development' && logPostMsg) {
            logger.log('### SecuredField::postMessageListener:: feedbackObj.numKey=', feedbackObj.numKey);
        }

        if (this.numKey !== feedbackObj.numKey) {
            if (this.sfConfig.showWarnings) {
                logger.warn(
                    'WARNING SecuredField :: postMessage listener for iframe :: data mismatch! (Probably a message from an unrelated securedField)'
                );
            }
            return;
        }

        // VALIDATION CHECKS PASSED - DECIDE ON COURSE OF ACTION
        if (process.env.NODE_ENV === 'development' && logPostMsg) {
            logger.log(
                '### SecuredField::postMessageListener:: numkeys match PROCEED WITH POST MESSAGE PROCESSING fieldType=',
                this.sfConfig.fieldType,
                'txVariant=',
                this.sfConfig.txVariant
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

            case 'enterKeyPressed':
                this.onKeyPressedCallback(feedbackObj);
                break;

            /**
             * Validate, because action =
             *
             *  'brand'
             *  'delete'
             *  'luhnCheck'
             *              //'incomplete field' (an error that follows from a focus (blur) event)
             *  'incorrectly filled field' (an error that follows from a focus (blur) event) // NEW
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
        off(this.iframeRef, 'load', this.iframeOnLoadListener, false);
        this.iframeContentWindow = null;
        removeAllChildren(this.holderEl);
    }

    /**
     * Returns whether the securedField is hidden OR whether it is optional and not in error
     */
    isOptionalOrHidden(): boolean {
        if (
            this.sfConfig.fieldType === ENCRYPTED_EXPIRY_DATE ||
            this.sfConfig.fieldType === ENCRYPTED_EXPIRY_MONTH ||
            this.sfConfig.fieldType === ENCRYPTED_EXPIRY_YEAR
        ) {
            switch (this.expiryDatePolicy) {
                case DATE_POLICY_HIDDEN:
                    return true;
                case DATE_POLICY_OPTIONAL:
                    return !this.hasError;
                default:
                    return false;
            }
        }

        if (this.sfConfig.fieldType === ENCRYPTED_SECURITY_CODE) {
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

    onKeyPressed(callbackFn: RtnType_callbackFn): SecuredField {
        this.onKeyPressedCallback = callbackFn;
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
        if (this.sfConfig.fieldType === ENCRYPTED_SECURITY_CODE) {
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

        if (
            this.sfConfig.fieldType === ENCRYPTED_EXPIRY_DATE ||
            this.sfConfig.fieldType === ENCRYPTED_EXPIRY_MONTH ||
            this.sfConfig.fieldType === ENCRYPTED_EXPIRY_YEAR
        ) {
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
        if (this.sfConfig.fieldType !== ENCRYPTED_SECURITY_CODE) return;

        // Only set if value has changed
        if (value === this.cvcPolicy) return;

        if (process.env.NODE_ENV === 'development' && doLog) logger.log(this.sfConfig.fieldType, '### SecuredField::cvcPolicy:: value=', value);

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
        if (
            this.sfConfig.fieldType !== ENCRYPTED_EXPIRY_DATE &&
            this.sfConfig.fieldType !== ENCRYPTED_EXPIRY_MONTH &&
            this.sfConfig.fieldType !== ENCRYPTED_EXPIRY_YEAR
        )
            return;

        // Only set if value has changed
        if (value === this.expiryDatePolicy) return;

        if (process.env.NODE_ENV === 'development' && doLog) logger.log(this.sfConfig.fieldType, '### SecuredField:expiryDatePolicy:: value=', value);

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
