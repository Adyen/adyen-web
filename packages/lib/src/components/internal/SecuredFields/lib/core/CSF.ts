import { handleConfig } from '../configuration/handleConfig';
import { configureCallbacks } from '../configuration/configureCallbacks';
import { handleProcessBrand } from './utils/processBrand';
import { handleValidation } from './handleValidation';
import { handleEncryption } from './handleEncryption';
import { createSecuredFields, createNonCardSecuredFields, createCardSecuredFields, setupSecuredField } from './createSecuredFields';
import { setFocusOnFrame } from './utils/iframes/setFocusOnFrame';
import { postMessageToAllIframes } from './utils/iframes/postMessageToAllIframes';
import { destroySecuredFields } from './destroySecuredFields';
import { processAutoComplete } from './utils/processAutoComplete';
import { handleFocus } from './utils/iframes/handleFocus';
import { handleIframeConfigFeedback } from './utils/iframes/handleIframeConfigFeedback';
import { isConfigured } from './utils/isConfigured';
import { assessFormValidity } from './utils/validateForm';
import { handleBinValue } from './utils/handleBinValue';
import { handleBrandFromBinLookup, sendBrandToCardSF } from './utils/handleBrandFromBinLookup';
import handleAdditionalFields from './utils/registerAdditionalField';
import tabHandlers from './utils/tabbing/handleTab';
import postMessageToIframe from './utils/iframes/postMessageToIframe';
import AbstractCSF from './AbstractCSF';
import { CSFReturnObject, BinLookupObject, SetupObject, StylesObject, CbObjOnAdditionalSF } from '../types';
import * as logger from '../utilities/logger';
import { selectOne } from '../utilities/dom';

const notConfiguredWarning = (str = 'You cannot use secured fields') => {
    logger.warn(`${str} - they are not yet configured. Use the 'onConfigSuccess' callback to know when this has happened.`);
};

class CSF extends AbstractCSF {
    // --
    constructor(setupObj: SetupObject) {
        super(setupObj);

        this.state = {
            /**
             *  For generic card will always be 'card'.
             *  For non-generic card will be hardcoded to a particular txVariant e.g. 'mc' or 'visa'
             */
            type: this.props.type,
            /**
             *  For generic card will change as shopper types
             *  For non-generic card will be fixed
             */
            brand: this.props.type !== 'card' ? this.props.type : null,
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
        };

        // Setup 'this' references
        this.configHandler = handleConfig;

        this.callbacksHandler = configureCallbacks;

        this.handleIframeConfigFeedback = handleIframeConfigFeedback;
        this.isConfigured = isConfigured;

        this.assessFormValidity = assessFormValidity;

        this.processBrand = handleProcessBrand;

        this.handleValidation = handleValidation;
        this.handleEncryption = handleEncryption;

        this.createSecuredFields = createSecuredFields;
        this.createNonCardSecuredFields = createNonCardSecuredFields;
        this.createCardSecuredFields = createCardSecuredFields;
        this.setupSecuredField = setupSecuredField;

        this.postMessageToAllIframes = postMessageToAllIframes;

        this.setFocusOnFrame = setFocusOnFrame;
        this.handleFocus = handleFocus;

        this.handleAdditionalFields = handleAdditionalFields.handleAdditionalFields;
        this.touchendListener = handleAdditionalFields.touchendListener.bind(this);
        this.destroyTouchendListener = handleAdditionalFields.destroyTouchendListener;

        this.handleSFShiftTab = tabHandlers.handleSFShiftTab;
        this.handleShiftTab = tabHandlers.handleShiftTab;

        this.destroySecuredFields = destroySecuredFields;

        this.processAutoComplete = processAutoComplete;

        this.handleBinValue = handleBinValue;

        this.brandsFromBinLookup = handleBrandFromBinLookup;
        this.sendBrandToCardSF = sendBrandToCardSF;

        // Populate config & callbacks objects & create securedFields
        this.init();
    }

    private init(): void {
        this.configHandler();
        this.callbacksHandler(this.props.callbacks);

        /**
         * Create all the securedFields
         */
        const numIframes: number = this.createSecuredFields();

        this.state.numIframes = this.state.originalNumIframes = numIframes;

        this.state.isKCP = !!this.props.isKCP;
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
                } else {
                    notConfiguredWarning('You cannot set focus on any secured field');
                }
            },
            // For component based implementation - if showValidation function is called on the component use this
            // function as a way to notify the CSF that a field is in error
            isValidated: (pFieldType: string, code: string): void => {
                if (this.state.isConfigured) {
                    if (Object.prototype.hasOwnProperty.call(this.state.securedFields, pFieldType)) {
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
                        postMessageToIframe(dataObj, this.getIframeContentWin(pFieldType), this.config.loadingContext);
                    }
                } else {
                    notConfiguredWarning('You cannot set validated on any secured field');
                }
            },
            hasUnsupportedCard: (pFieldType: string, code: string): void => {
                if (this.state.isConfigured) {
                    if (Object.prototype.hasOwnProperty.call(this.state.securedFields, pFieldType)) {
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
                        postMessageToIframe(dataObj, this.getIframeContentWin(pFieldType), this.config.loadingContext);
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
            brandsFromBinLookup: (brandsObj: BinLookupObject): void => {
                if (!this.config.isCreditCardType) return null;

                if (this.state.isConfigured) {
                    this.brandsFromBinLookup(brandsObj);
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

                    const callbackObj: CbObjOnAdditionalSF = { additionalIframeRemoved: true, fieldType: pFieldType, type: this.state.type };
                    this.callbacks.onAdditionalSFRemoved(callbackObj);
                }
            },
            setKCPStatus: (isKCP: boolean): void => {
                this.state.isKCP = isKCP;
            }
        };

        return returnObj;
    }

    /**
     * Retrieves the iframe, stored by field type, & returns it's contentWindow
     */
    private getIframeContentWin(fieldType: string): Window {
        return this.state.securedFields[fieldType]?.iframeContentWindow || null;
    }
}

export default CSF;
