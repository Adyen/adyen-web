import { select, getAttribute } from '../../utilities/dom';
import {
    ENCRYPTED_EXPIRY_YEAR,
    DATE_POLICY_REQUIRED,
    CVC_POLICY_REQUIRED,
    DATA_ENCRYPTED_FIELD_ATTR,
    DATA_INFO,
    DATA_UID
} from '../../configuration/constants';
import { existy } from '../../utilities/commonUtils';
import cardType from '../utils/cardType';
import { SFSetupObject } from '../../securedField/AbstractSecuredField';
import SecuredField from '../../securedField/SecuredField';
import { CardObject, CbObjOnBrand, SFFeedbackObj, CbObjOnLoad, CVCPolicyType } from '../../types';

/**
 * cvcPolicy - 'required' | 'optional' | 'hidden'
 * - Always 'required' for GiftCards
 * - Usually 'required' for single branded Credit Cards but with exceptions e.g. maestro ('optional'), bcmc ('hidden').
 * - Always 'required' for generic Credit Cards at start up - in this case, subsequent, supporting information about whether cvc stops being required
 * comes from the SF in the brand information (as the shopper inputs the cc number)
 */
let cvcPolicy: CVCPolicyType;

/**
 * Bound to the instance of CSF
 * Handles specific functionality related to configuring & creating SecuredFields
 */
export function createSecuredFields(): number {
    this.encryptedAttrName = DATA_ENCRYPTED_FIELD_ATTR;

    // Detect DOM elements that qualify as securedField holders
    const securedFields: HTMLElement[] = select(this.props.rootNode, `[${this.encryptedAttrName}]`);

    cvcPolicy = CVC_POLICY_REQUIRED;

    // CHECK IF THIS SECURED FIELD IS NOT OF A CREDIT CARD TYPE
    if (!this.config.isCreditCardType) {
        this.createNonCardSecuredFields(securedFields);
        return securedFields.length;
    }

    // CONTINUE AS CREDIT-CARD TYPE...
    this.isSingleBrandedCard = false;

    this.securityCode = '';

    this.createCardSecuredFields(securedFields);

    // Return the number of iframes we're going to create
    return securedFields.length;
}

/**
 * i.e. giftcard and ach fields
 *
 * Create a new SecuredField for each detected holding element
 */
export async function createNonCardSecuredFields(securedFields: HTMLElement[]): Promise<any> {
    for (let i = 0; i < securedFields.length; i++) {
        const securedField = securedFields[i];
        await this.setupSecuredField(securedField);
    }
}

export async function createCardSecuredFields(securedFields: HTMLElement[]): Promise<any> {
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
        } else {
            // Assess whether cvc field is required based on the card type & whether the cvc field should even be visible
            cvcPolicy = (card.cvcPolicy as CVCPolicyType) || CVC_POLICY_REQUIRED;

            this.securityCode = card.securityCode;
        }
    }

    /**
     * Create a new SecuredField for each detected holding element
     *
     * - we do this in sequence, waiting until one has configured before creating the next.
     * We do it this way to avoid the 'bug' whereby if something interrupts the loading of an iframe the listener we have for its load event
     * never fires; which means the iframe never configures.
     * (NB - you can recreate this 'bug' by creating the securedFields in a synchronous loop:
     *      securedFields.forEach(this.setupSecuredField.bind(this));
     *  and putting a breakpoint on the line where we declare the setupSecuredField function)
     *
     *  Also note we tried the Array.map/Promise.all way of asynchronously looping through an array - but it didn't fix the issue,
     *  - so we fall back to a good old for-loop
     */
    for (let i = 0; i < securedFields.length; i++) {
        const securedField = securedFields[i];
        if (window._b$dl) console.log('\nAbout to set up securedField:', securedField);
        await this.setupSecuredField(securedField);
        if (window._b$dl) console.log('Finished setting up securedField:', securedField);
    }
    if (window._b$dl) console.log('Finished setting up all securedFields');

    /**
     * Now the securedFields have all been created and configured...
     *
     * For a single branded card we call to onBrand callback once.
     * This allows the ui to set the correct logo if they haven't already,
     * and we also pass the cvcPolicy so the UI can hide the CVC iframe holder if necessary
     */
    if (this.isSingleBrandedCard) {
        const callbackObj: CbObjOnBrand = {
            type: this.state.type,
            rootNode: this.props.rootNode,
            brand: type,
            cvcPolicy,
            cvcText: this.securityCode
        };

        // Allow a tick for the securedField to finish rendering
        setTimeout(() => {
            this.callbacks.onBrand(callbackObj);
        }, 0);
    }
}

// Run for each detected holder of a securedField...
export function setupSecuredField(pItem: HTMLElement): Promise<any> {
    return new Promise(resolve => {
        /**
         *  possible values:
         *  encryptedCardNumber
         *  encryptedExpiryDate
         *  encryptedExpiryMonth
         *  encryptedExpiryYear
         *  encryptedSecurityCode
         *  encryptedPassword
         *  encryptedPin???
         *  encryptedBankAccountNumber
         *  encryptedBankLocationId
         *  encryptedIBAN
         */
        const fieldType: string = getAttribute(pItem, this.encryptedAttrName);

        if (fieldType === ENCRYPTED_EXPIRY_YEAR) {
            this.state.hasSeparateDateFields = true;
        }

        const extraFieldData: string = getAttribute(pItem, DATA_INFO);
        const uid = getAttribute(pItem, DATA_UID);

        // ////// CREATE SecuredField passing in configObject of props that will be set on the SecuredField instance
        const setupObj: SFSetupObject = {
            fieldType,
            extraFieldData,
            uid,
            txVariant: this.state.type,
            cardGroupTypes: this.config.cardGroupTypes,
            iframeUIConfig: this.config.iframeUIConfig ? this.config.iframeUIConfig : {},
            sfLogAtStart: this.config.sfLogAtStart,
            trimTrailingSeparator: this.config.trimTrailingSeparator,
            cvcPolicy,
            expiryDatePolicy: DATE_POLICY_REQUIRED,
            isCreditCardType: this.config.isCreditCardType,
            iframeSrc: this.config.iframeSrc,
            loadingContext: this.config.loadingContext,
            showWarnings: this.config.showWarnings,
            holderEl: pItem,
            legacyInputMode: this.config.legacyInputMode,
            minimumExpiryDate: this.config.minimumExpiryDate,
            implementationType: this.config.implementationType,
            bundleType: this.config.bundleType,
            isCollatingErrors: this.config.isCollatingErrors
        };

        const sf: SecuredField = new SecuredField(setupObj, this.props.i18n)
            .onIframeLoaded((): void => {
                // Count
                this.state.iframeCount += 1;

                // If all iframes are loaded - call onLoad callback
                if (this.state.iframeCount === this.state.originalNumIframes) {
                    const callbackObj: CbObjOnLoad = { iframesLoaded: true };
                    this.callbacks.onLoad(callbackObj);
                }
            })
            .onConfig((pFeedbackObj: SFFeedbackObj): void => {
                this.handleIframeConfigFeedback(pFeedbackObj);
                resolve(pFeedbackObj);
            })
            .onFocus((pFeedbackObj: SFFeedbackObj): void => {
                this.handleFocus(pFeedbackObj);
            })
            .onBinValue((pFeedbackObj: SFFeedbackObj): void => {
                this.handleBinValue(pFeedbackObj);
            })
            .onTouchstart((pFeedbackObj: SFFeedbackObj): void => {
                // re. Disabling arrow keys in iOS - need to disable all other fields in the form
                this.callbacks.onTouchstartIOS({ fieldType: pFeedbackObj.fieldType });

                // iOS ONLY - RE. iOS BUGS AROUND BLUR AND FOCUS EVENTS
                // - pass information about which field has just been clicked (gained focus) to the other iframes
                this.postMessageToAllIframes({ fieldType: pFeedbackObj.fieldType, fieldClick: true });
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
    });
}
