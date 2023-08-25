import AbstractCSF from './AbstractCSF';
import { CSFReturnObject, CSFSetupObject, CSFStateObject } from './types';
import { StylesObject, CbObjOnAdditionalSF } from '../types';
import { BinLookupResponse } from '../../../../Card/types';
import { handleConfig } from './extensions/handleConfig';
import { configureCallbacks } from './extensions/configureCallbacks';
import { handleValidation } from './extensions/handleValidation';
import { handleEncryption } from './extensions/handleEncryption';
import { createSecuredFields, createNonCardSecuredFields, createCardSecuredFields, setupSecuredField } from './extensions/createSecuredFields';
import handleIOSTouchEvents from './extensions/handleIOSTouchEvents';
import handleTab from './extensions/handleTab';
import handleBrandFromBinLookup, { sendBrandToCardSF, sendExpiryDatePolicyToSF } from './extensions/handleBrandFromBinLookup';
import { setFocusOnFrame } from './partials/setFocusOnFrame';
import { postMessageToAllIframes } from './partials/postMessageToAllIframes';
import processBrand from './partials/processBrand';
import { processAutoComplete } from './partials/processAutoComplete';
import { handleFocus } from './partials/handleFocus';
import { handleIframeConfigFeedback } from './partials/handleIframeConfigFeedback';
import { isConfigured } from './partials/isConfigured';
import validateForm from './partials/validateForm';
import { handleBinValue } from './partials/handleBinValue';
import { destroySecuredFields } from './utils/destroySecuredFields';
import postMessageToIframe from './utils/iframes/postMessageToIframe';
import getIframeContentWin from './utils/iframes/getIframeContentWin';
import * as logger from '../utilities/logger';
import { on, selectOne } from '../utilities/dom';
import { partial } from '../utilities/commonUtils';
import { hasOwnProperty } from '../../../../../utils/hasOwnProperty';
import ua from './utils/userAgent';
import { SingleBrandResetObject } from '../../SFP/types';

const notConfiguredWarning = (str = 'You cannot use secured fields') => {
    logger.warn(`${str} - they are not yet configured. Use the 'onConfigSuccess' callback to know when this has happened.`);
};

class CSF extends AbstractCSF {
    // --
    constructor(setupObj: CSFSetupObject) {
        /**
         * Initialises:
         *  - this.props = setupObj: CSFSetupObject
         *
         * and empty objects for:
         *  - this.config: CSFConfigObject (populated in handleConfig.ts)
         *  - this.callbacks: CSFCallbacksConfig (populated in configureCallbacks.ts
         *  - this.state: CSFStateObject (populated below)
         */
        super(setupObj);

        this.state = {
            /**
             *  For generic card will always be 'card'.
             *  For non-generic card will be hardcoded to a particular txVariant e.g. 'mc' or 'visa'
             *  For other types of SecuredField will be the passed type e.g. 'ach' or 'giftcard'
             */
            type: this.props.type,
            /**
             *  For generic card will change as shopper types
             *  For non-generic card will be fixed
             */
            brand: this.props.type !== 'card' ? { brand: this.props.type, cvcPolicy: 'required' } : { brand: null, cvcPolicy: 'required' },
            allValid: undefined,
            numIframes: 0,
            originalNumIframes: 0,
            iframeCount: 0,
            iframeConfigCount: 0,
            isConfigured: false,
            hasSeparateDateFields: false,
            currentFocusObject: null,
            registerFieldForIos: false,
            securedFields: {},
            isKCP: false
        } as CSFStateObject;

        const thisObj = { csfState: this.state, csfConfig: this.config, csfProps: this.props, csfCallbacks: this.callbacks };

        // Setup 'this' references
        this.configHandler = handleConfig;

        this.callbacksHandler = configureCallbacks;

        this.validateForm = partial(validateForm, thisObj);

        this.isConfigured = partial(isConfigured, thisObj, this.validateForm);
        this.handleIframeConfigFeedback = partial(handleIframeConfigFeedback, thisObj, this.isConfigured);

        this.processBrand = partial(processBrand, thisObj);

        this.handleValidation = handleValidation;
        this.handleEncryption = handleEncryption;

        this.createSecuredFields = createSecuredFields;
        this.createNonCardSecuredFields = createNonCardSecuredFields;
        this.createCardSecuredFields = createCardSecuredFields;
        // #################   here!!!!
        this.setupSecuredField = setupSecuredField;

        this.postMessageToAllIframes = partial(postMessageToAllIframes, thisObj);

        this.setFocusOnFrame = partial(setFocusOnFrame, thisObj);
        this.handleFocus = partial(handleFocus, thisObj);

        this.handleIOSTouchEvents = handleIOSTouchEvents.handleTouchend;
        this.touchendListener = handleIOSTouchEvents.touchendListener.bind(this);
        this.destroyTouchendListener = handleIOSTouchEvents.destroyTouchendListener;
        this.touchstartListener = handleIOSTouchEvents.touchstartListener.bind(this);
        this.destroyTouchstartListener = handleIOSTouchEvents.destroyTouchstartListener;

        this.handleSFShiftTab = handleTab.handleSFShiftTab;
        this.handleShiftTab = handleTab.handleShiftTab;

        this.destroySecuredFields = destroySecuredFields;

        this.processAutoComplete = partial(processAutoComplete, thisObj);

        this.handleBinValue = partial(handleBinValue, thisObj);

        this.handleBrandFromBinLookup = handleBrandFromBinLookup;
        this.sendBrandToCardSF = sendBrandToCardSF;
        this.sendExpiryDatePolicyToSF = sendExpiryDatePolicyToSF;

        // Populate config & callbacks objects & create securedFields
        this.init();
    }

    private init(): void {
        this.configHandler(this.props);
        this.callbacksHandler(this.props.callbacks);

        /**
         * Create all the securedFields
         */
        const numIframes: number = this.createSecuredFields();

        this.state.numIframes = this.state.originalNumIframes = numIframes;

        this.state.isKCP = !!this.props.isKCP;

        /**
         * Add touchstart listener
         * re. Disabling arrow keys in iOS
         */
        if (ua.__IS_IOS && this.config.shouldDisableIOSArrowKeys) {
            this.hasGenuineTouchEvents = false;
            on(document, 'touchstart', this.touchstartListener);
        }
    }

    // Expose functions that can be called on the CSF instance
    public createReturnObject(): CSFReturnObject {
        // --
        const returnObj: CSFReturnObject = {
            // --
            updateStyles: (pStyleObject: StylesObject): void => {
                if (this.state.isConfigured) {
                    this.postMessageToAllIframes({ styleObject: pStyleObject });
                } else {
                    logger.warn(
                        'You cannot update the secured fields styling ' +
                            "- they are not yet configured. Use the 'onConfigSuccess' callback to know when this has happened."
                    );
                }
            },
            setFocusOnFrame: (pFieldType: string): void => {
                if (this.state.isConfigured) {
                    this.setFocusOnFrame(pFieldType);
                    // Comment in a quick way to test destroying secured fields (also see comment in destroySecuredFields)
                    // this.destroySecuredFields();
                } else {
                    notConfiguredWarning('You cannot set focus on any secured field');
                }
            },
            // For component based implementation - if showValidation function is called on the component use this
            // function as a way to notify the CSF that a field is in error
            isValidated: (pFieldType: string, code: string): void => {
                if (this.state.isConfigured) {
                    if (hasOwnProperty(this.state.securedFields, pFieldType)) {
                        this.state.securedFields[pFieldType].hasError = true;

                        // If there's not already an errorType, set one
                        // NOTE: fixes issue in Components where you first validate and then start typing a maestro number
                        // - w/o this and the corresponding fix in the SecuredField class the maestro PM will never register as valid
                        if (this.state.securedFields[pFieldType].errorType === '') {
                            this.state.securedFields[pFieldType].errorType = 'isValidated';
                        }

                        // Inform iframe
                        const dataObj: object = {
                            txVariant: this.state.type,
                            fieldType: pFieldType,
                            externalValidation: true,
                            code,
                            numKey: this.state.securedFields[pFieldType].numKey
                        };
                        postMessageToIframe(dataObj, getIframeContentWin(this.state, pFieldType), this.config.loadingContext);
                    }
                } else {
                    notConfiguredWarning('You cannot set validated on any secured field');
                }
            },
            hasUnsupportedCard: (pFieldType: string, code: string): void => {
                if (this.state.isConfigured) {
                    if (hasOwnProperty(this.state.securedFields, pFieldType)) {
                        //
                        this.state.securedFields[pFieldType].hasError = !!code;
                        this.state.securedFields[pFieldType].errorType = code;

                        // Inform iframe
                        const dataObj: object = {
                            txVariant: this.state.type,
                            fieldType: pFieldType,
                            unsupportedCard: !!code,
                            code,
                            numKey: this.state.securedFields[pFieldType].numKey
                        };
                        postMessageToIframe(dataObj, getIframeContentWin(this.state, pFieldType), this.config.loadingContext);
                    }
                } else {
                    notConfiguredWarning('You cannot set hasUnsupportedCard on any secured field');
                }
            },
            destroy: (): void => {
                if (this.state.isConfigured) {
                    this.destroySecuredFields();
                } else {
                    notConfiguredWarning('You cannot destroy secured fields');
                }
            },
            brandsFromBinLookup: (binLookupResponse: BinLookupResponse, resetObj: SingleBrandResetObject): void => {
                if (!this.config.isCreditCardType) return null;

                if (this.state.isConfigured) {
                    this.handleBrandFromBinLookup(binLookupResponse, resetObj);
                } else {
                    notConfiguredWarning('You cannot set pass brands to secured fields');
                }
            },
            addSecuredField: (pFieldType: string): void => {
                const securedField: HTMLElement = selectOne(this.props.rootNode, `[data-cse="${pFieldType}"]`);
                if (securedField) {
                    this.state.numIframes += 1;
                    this.setupSecuredField(securedField);
                }
            },
            removeSecuredField: (pFieldType: string): void => {
                if (this.state.securedFields[pFieldType]) {
                    this.state.securedFields[pFieldType].destroy();
                    delete this.state.securedFields[pFieldType];
                    this.state.numIframes -= 1;
                    this.state.iframeCount -= 1;

                    const callbackObj: CbObjOnAdditionalSF = { additionalIframeRemoved: true, fieldType: pFieldType, type: this.state.type };
                    this.callbacks.onAdditionalSFRemoved(callbackObj);
                }
            },
            setKCPStatus: (isKCP: boolean): void => {
                this.state.isKCP = isKCP;
            },
            sfIsOptionalOrHidden: (fieldType: string): boolean => {
                return this.state.securedFields[fieldType].isOptionalOrHidden();
            }
        };

        return returnObj;
    }
}

export default CSF;
