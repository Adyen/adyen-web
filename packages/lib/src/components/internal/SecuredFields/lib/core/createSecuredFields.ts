import { select, getAttribute } from '../utilities/dom';
import { ENCRYPTED_SECURITY_CODE, ENCRYPTED_EXPIRY_YEAR } from '../configuration/constants';
import { existy } from '../utilities/commonUtils';
import cardType from '../utilities/cardType';
import { SFSetupObject } from './AbstractSecuredField';
import SecuredField from './SecuredField';
import { CardObject, CbObjOnBrand, SFFeedbackObj, CbObjOnLoad } from '../types';
import * as logger from '../utilities/logger';

export function createSecuredFields(): number {
    // Detect DOM elements that qualify as securedField holders
    this.encryptedAttrName = 'data-encrypted-field';

    if (process.env.NODE_ENV === 'development' && window._b$dl) {
        logger.log('\n### CreateSF::createSecuredFields:: this.state.type=', this.state.type);
        logger.log('\n### CreateSF::createSecuredFields:: this.config.iframeSrc=', this.config.iframeSrc);
    }

    // Detect DOM elements that qualify as securedField holders
    let securedFields: HTMLElement[] = select(this.props.rootNode, `[${this.encryptedAttrName}]`);

    // Fallback to old attr name
    if (!securedFields.length) {
        this.encryptedAttrName = 'data-cse';
        securedFields = select(this.props.rootNode, `[${this.encryptedAttrName}]`);
    }

    /**
     * Is the CVC field required?
     * - Always true for GiftCards
     * - Usually true for single branded Credit Cards but with exceptions e.g. maestro, bcmc.
     * - Always true for generic Credit Cards at start up - in this case, subsequent, supporting information about whether cvc stops being required comes
     * from the SF in the brand information (as the shopper inputs the cc number)
     */
    this.cvcRequired = true;

    // CHECK IF THIS SECURED FIELD IS NOT OF A CREDIT CARD TYPE
    if (!this.config.isCreditCardType) {
        return this.createNonCardSecuredFields(securedFields);
    }

    // CONTINUE AS CREDIT-CARD TYPE...
    this.isSingleBrandedCard = false;

    // Should the CVC field be hidden for this card type?
    // Always false, except for BCMC
    this.hideCVC = false;

    // re. BCMC - boolean to indicate whether the markup contains a CVC field that shouldn't be there
    this.hasRedundantCVCField = false;

    this.securityCode = '';

    return this.createCardSecuredFields(securedFields);
}

export function createNonCardSecuredFields(securedFields: HTMLElement[]): number {
    // Create a new SecuredField for each detected holding element
    securedFields.forEach(this.setupSecuredField.bind(this));
    return securedFields.length;
}

export function createCardSecuredFields(securedFields: HTMLElement[]): number {
    // Declared card type from the initialisation of CSF
    let type: string = this.state.type;

    // Maybe it's a single branded card defined by setting type: 'card' & a single item in cardGroupTypes
    // In which case update the type var both locally AND in State
    if (type === 'card' && this.config.cardGroupTypes.length === 1) {
        type = this.config.cardGroupTypes[0];
        this.state.type = type;
    }

    // So, is it a single branded card?
    this.isSingleBrandedCard = type !== 'card';

    // If single branded card field...
    if (this.isSingleBrandedCard) {
        // Check that type exists
        const card: CardObject = cardType.getCardByBrand(type);

        // It's possible we don't recognise the card type -
        // scenario: frontend initially recognises card as e.g. Visa - but then backend tokenises it as a sub-brand which we currently don't recognise
        if (!existy(card)) {
            this.state.type = 'unrecognised-single-brand'; // Will let CVC field accept 4 digits in the input
            this.cvcRequired = true;
            this.hideCVC = false;
        } else {
            // Assess whether cvc field is required based on the card type
            this.cvcRequired = !(existy(card.cvcRequired) && !card.cvcRequired);

            // Assess whether the cvc field should even be visible
            this.hideCVC = card.hideCVC === true;

            this.securityCode = card.securityCode;
        }
    } else {
        // Check passed cardGroupTypes
        this.config.cardGroupTypes.forEach(pItem => {
            if (!existy(cardType.getCardByBrand(pItem))) {
                logger.warn(
                    `WARNING: The passed cardGroupType item "${pItem}" is not recognised by SecuredFields. This may affect whether it will be possible to process this payment.`
                );
            }
        });
    }

    // Create a new SecuredField for each detected holding element
    securedFields.forEach(this.setupSecuredField.bind(this));

    // For single branded card we call to onBrand callback once.
    // This allows the ui to set the correct logo if they haven't already and we also pass a hideCVC property
    // - so the UI can hide the CVC iframe holder if necessary
    if (this.isSingleBrandedCard) {
        const callbackObj: CbObjOnBrand = {
            type: this.state.type,
            rootNode: this.props.rootNode,
            brand: type,
            hideCVC: this.hideCVC,
            cvcRequired: this.cvcRequired,
            cvcText: this.securityCode
            //                maxLength: (type === 'amex')? 4 : 3,
        };

        setTimeout(() => {
            this.callbacks.onBrand(callbackObj);
        }, 0);
    }

    // Return the number of iframes we've created
    // - taking into account whether we initially tried to create one for an unnecessary CVC field
    return this.hasRedundantCVCField ? securedFields.length - 1 : securedFields.length;
}

// forEach detected holder for a securedField...
export function setupSecuredField(pItem: HTMLElement): void {
    /**
     *  possible values:
     *  encryptedCardNumber
     *  encryptedExpiryDate
     *  encryptedExpiryMonth
     *  encryptedExpiryYear
     *  encryptedSecurityCode
     *  encryptedPassword
     *  encryptedPin
     *  encryptedBankAccountNumber
     *  encryptedBankLocationId
     *  encryptedIBAN
     */
    const fieldType: string = getAttribute(pItem, this.encryptedAttrName);

    if (fieldType === ENCRYPTED_EXPIRY_YEAR) {
        this.state.hasSeparateDateFields = true;
    }

    const extraFieldData: string = getAttribute(pItem, 'data-info');

    // CVC FIELD CHECKS
    // If we have a fieldType for CVC field AND it's a single branded card AND hideCVC is true...
    // ...then we are showing a CVC field when we shouldn't e.g. for a BCMC card - so don't make an iframe
    if (fieldType === ENCRYPTED_SECURITY_CODE && this.isSingleBrandedCard && this.hideCVC) {
        // We have an unnecessary CVC field
        this.hasRedundantCVCField = true;
        return;
    } // -- end CVC FIELD CHECKS

    // ////// CREATE SecuredField passing in configObject of props that will be set on the SecuredField instance
    const setupObj: SFSetupObject = {
        fieldType,
        extraFieldData,
        txVariant: this.state.type,
        cardGroupTypes: this.config.cardGroupTypes,
        iframeUIConfig: this.config.iframeUIConfig ? this.config.iframeUIConfig : {},
        sfLogAtStart: this.config.sfLogAtStart,
        trimTrailingSeparator: this.config.trimTrailingSeparator,
        cvcRequired: this.cvcRequired,
        isCreditCardType: this.config.isCreditCardType,
        iframeSrc: this.config.iframeSrc,
        loadingContext: this.config.loadingContext,
        showWarnings: this.config.showWarnings,
        holderEl: pItem
    };

    const sf: SecuredField = new SecuredField(setupObj, this.props.i18n)
        .onIframeLoaded((): void => {
            // Count
            this.state.iframeCount += 1;

            if (process.env.NODE_ENV === 'development' && window._b$dl) {
                logger.log('### createSecuredFields:::: onIframeLoaded::type=', this.state.type, 'iframeCount=', this.state.iframeCount);
                logger.log(
                    '### createSecuredFields:::: onIframeLoaded::type=',
                    this.state.type,
                    'this.state.originalNumIframes=',
                    this.state.originalNumIframes
                );
            }

            // If all iframes are loaded - call onLoad callback
            if (this.state.iframeCount === this.state.originalNumIframes) {
                if (process.env.NODE_ENV === 'development' && window._b$dl) {
                    logger.log(
                        '\n### createSecuredFields:::: onIframeLoaded:: ALL IFRAMES LOADED type=',
                        this.state.type,
                        'DO CALLBACK callbacks=',
                        this.callbacks
                    );
                }

                const callbackObj: CbObjOnLoad = { iframesLoaded: true };
                this.callbacks.onLoad(callbackObj);
            }
        })
        .onConfig((pFeedbackObj: SFFeedbackObj): void => {
            this.handleIframeConfigFeedback(pFeedbackObj);
        })
        .onFocus((pFeedbackObj: SFFeedbackObj): void => {
            this.handleFocus(pFeedbackObj);
        })
        .onBinValue((pFeedbackObj: SFFeedbackObj): void => {
            this.handleBinValue(pFeedbackObj);
        })
        .onClick((pFeedbackObj: SFFeedbackObj): void => {
            // iOS ONLY - RE. iOS BUGS AROUND BLUR AND FOCUS EVENTS
            // - pass information about which field has just been clicked (gained focus) to the other iframes
            this.postMessageToAllIframes({ fieldType: pFeedbackObj.fieldType, click: true });
        })
        .onShiftTab((pFeedbackObj: SFFeedbackObj): void => {
            // Only happens for Firefox & IE <= 11
            this.handleSFShiftTab(pFeedbackObj.fieldType);
        })
        .onEncryption((pFeedbackObj: SFFeedbackObj): void => {
            this.handleEncryption(pFeedbackObj);
        })
        .onValidation((pFeedbackObj: SFFeedbackObj): void => {
            this.handleValidation(pFeedbackObj);
        })
        .onAutoComplete((pFeedbackObj: SFFeedbackObj): void => {
            this.processAutoComplete(pFeedbackObj);
        });

    // Store reference to securedField in this.state (under fieldType)
    this.state.securedFields[fieldType] = sf;
}
