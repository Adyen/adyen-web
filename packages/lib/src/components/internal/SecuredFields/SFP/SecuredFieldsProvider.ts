import { Component } from 'preact';
import { getErrorObject, getFields, getErrorReducer, validFieldsReducer } from './SFPUtils';
import initCSF from '../lib/CSF';
import handlers from './SecuredFieldsProviderHandlers';
import defaultProps from './defaultProps';
import { SFPProps, SFPState, SingleBrandResetObject } from './types';
import {
    StylesObject,
    CbObjOnError,
    CbObjOnFocus,
    CbObjOnBrand,
    CbObjOnAllValid,
    CbObjOnFieldValid,
    CbObjOnAutoComplete,
    CbObjOnConfigSuccess,
    CbObjOnLoad
} from '../lib/types';
import { CSFReturnObject, CSFSetupObject } from '../lib/CSF/types';
import {
    CVC_POLICY_REQUIRED,
    DATE_POLICY_REQUIRED,
    DEDICATED_CARD_COMPONENTS,
    ENCRYPTED_CARD_NUMBER,
    ENCRYPTED_PWD_FIELD
} from '../lib/configuration/constants';
import { BinLookupResponse } from '../../../Card/types';
import AdyenCheckoutError from '../../../../core/Errors/AdyenCheckoutError';
import { SFStateErrorObj } from '../../../Card/components/CardInput/types';
import { getErrorMessageFromCode } from '../../../../core/Errors/utils';
import { SF_ErrorCodes } from '../../../../core/Errors/constants';

/**
 * SecuredFieldsProvider:
 * Initialises & handles the client-side part of SecuredFields
 */
class SecuredFieldsProvider extends Component<SFPProps, SFPState> {
    private csfLoadFailTimeout: number;
    private csfLoadFailTimeoutMS: number;
    private csfConfigFailTimeout: number;
    private csfConfigFailTimeoutMS: number;
    private numCharsInField: object;
    private rootNode;
    private numDateFields: number;
    private csf: CSFReturnObject;
    private handleOnLoad: (obj: CbObjOnLoad) => void;
    private handleOnConfigSuccess: (obj: CbObjOnConfigSuccess) => void;
    private handleOnFieldValid: (obj: CbObjOnFieldValid) => void;
    private handleOnAllValid: (obj: CbObjOnAllValid) => void;
    private handleOnBrand: (obj: CbObjOnBrand) => void;
    private handleFocus: (obj: CbObjOnFocus) => void;
    private handleOnError: (obj: CbObjOnError, hasUnsupportedCard?: boolean) => void;
    private handleOnAutoComplete: (obj: CbObjOnAutoComplete) => void;
    private handleOnNoDataRequired: () => void;
    private handleOnTouchstartIOS: (obj) => void;
    public state: SFPState;
    public props;
    private issuingCountryCode;

    constructor(props: SFPProps) {
        super(props);

        const stateObj: SFPState = {
            status: 'loading',
            brand: props.type,
            errors: {},
            valid: {},
            data: {},
            cvcPolicy: CVC_POLICY_REQUIRED,
            expiryDatePolicy: DATE_POLICY_REQUIRED,
            isSfpValid: false,
            hasKoreanFields: props.hasKoreanFields
        };
        this.state = stateObj;

        this.csfLoadFailTimeout = null;
        this.csfLoadFailTimeoutMS = 30000;

        this.csfConfigFailTimeout = null;
        this.csfConfigFailTimeoutMS = 15000;

        this.numCharsInField = {};

        // Handlers
        this.handleOnLoad = handlers.handleOnLoad.bind(this);
        this.handleOnConfigSuccess = handlers.handleOnConfigSuccess.bind(this);
        this.handleOnFieldValid = handlers.handleOnFieldValid.bind(this);
        this.handleOnAllValid = handlers.handleOnAllValid.bind(this);
        this.handleOnBrand = handlers.handleOnBrand.bind(this);
        this.handleFocus = handlers.handleFocus.bind(this);
        this.handleOnError = handlers.handleOnError.bind(this);
        this.handleOnNoDataRequired = handlers.handleOnNoDataRequired.bind(this);
        this.handleOnAutoComplete = handlers.handleOnAutoComplete.bind(this);
        this.handleOnTouchstartIOS = handlers.handleOnTouchstartIOS.bind(this); // Only called when iOS detected

        this.processBinLookupResponse = this.processBinLookupResponse.bind(this);

        // Bindings for functions exposed to users of this component: SecuredFields & CardInput
        this.setFocusOn = this.setFocusOn.bind(this);
        this.updateStyles = this.updateStyles.bind(this);
        this.handleUnsupportedCard = this.handleUnsupportedCard.bind(this);
        this.showValidation = this.showValidation.bind(this);
        this.destroy = this.destroy.bind(this);
    }

    public static defaultProps = defaultProps;

    public componentDidMount(): void {
        // When SFP instantiated through SecuredFieldsInput c.f. CardInput
        if (this.props.rootNode) {
            this.setRootNode(this.props.rootNode);
        }

        // Find encryptedFields and map them to the values we use to store valid states
        const fields = getFields(this.rootNode);
        const valid = fields.reduce(validFieldsReducer, {});

        this.setState({ valid });

        // Populate numCharsInField object
        fields.forEach(field => {
            this.numCharsInField[field] = 0;
        });

        // Store how many dateFields we are dealing with visually
        this.numDateFields = fields.filter(f => f.match(/Expiry/)).length;

        if (fields.length) {
            this.destroy(); // TODO test if this solves the React double render problem.
            this.initializeCSF(this.rootNode);
        } else {
            this.handleOnNoDataRequired();
        }
    }

    public componentDidUpdate() {
        this.checkForKCPFields();
    }

    public componentWillUnmount(): void {
        this.csf = null;
        clearTimeout(this.csfLoadFailTimeout);
        clearTimeout(this.csfConfigFailTimeout);
    }

    private initializeCSF(root: HTMLElement): void {
        let loadingContext = this.props.loadingContext;

        // For loading securedFields from local server during development
        if (process.env.NODE_ENV === 'development' && process.env.__SF_ENV__ !== 'build') {
            loadingContext = process.env.__SF_ENV__;
        }

        // TODO
        // if(!this.props.keypadFix){
        // send analytics action because to know if anyone *ever* sets this config prop
        // }

        const csfSetupObj: CSFSetupObject = {
            rootNode: root,
            type: this.props.type,
            clientKey: this.props.clientKey,
            cardGroupTypes: this.props.brands,
            autoFocus: this.props.autoFocus,
            trimTrailingSeparator: this.props.trimTrailingSeparator,
            loadingContext,
            keypadFix: this.props.keypadFix,
            showWarnings: this.props.showWarnings,
            iframeUIConfig: {
                sfStyles: this.props.styles
            },
            i18n: this.props.i18n,
            callbacks: {
                onLoad: this.handleOnLoad,
                onConfigSuccess: this.handleOnConfigSuccess,
                onFieldValid: this.handleOnFieldValid,
                onAllValid: this.handleOnAllValid,
                onBrand: this.handleOnBrand,
                onError: this.handleOnError,
                onFocus: this.handleFocus,
                onBinValue: this.props.onBinValue,
                onAutoComplete: this.handleOnAutoComplete,
                onAdditionalSFConfig: this.props.onAdditionalSFConfig,
                onAdditionalSFRemoved: this.props.onAdditionalSFRemoved,
                onTouchstartIOS: this.handleOnTouchstartIOS
            },
            isKCP: this.state.hasKoreanFields,
            legacyInputMode: this.props.legacyInputMode,
            minimumExpiryDate: this.props.minimumExpiryDate,
            implementationType: this.props.implementationType || 'components', // to distinguish between 'regular' and 'custom' card component
            forceCompat: this.props.forceCompat,
            maskSecurityCode: this.props.maskSecurityCode,
            shouldDisableIOSArrowKeys: !!this.props.disableIOSArrowKeys, // convert whether function has been defined into a boolean
            placeholders: this.props.placeholders ?? {},
            showContextualElement: this.props.showContextualElement
        };

        this.csf = initCSF(csfSetupObj);

        /**
         * Expect to at least have had the handleOnLoad callback called within this time
         * - if this hasn't happened then something has happened to interrupt the loading of the securedFields
         * So we need to clear the loading spinner to see if the securedFields are reporting anything
         */
        // @ts-ignore - timout 'type' is a number
        this.csfLoadFailTimeout = setTimeout(() => {
            if (this.state.status !== 'ready') {
                // Hide the spinner
                this.setState({ status: 'csfLoadFailure' });
                // Report the error
                this.props.onError(new AdyenCheckoutError('ERROR', 'secured field iframes have failed to load'));
            }
        }, this.csfLoadFailTimeoutMS);
    }

    private checkForKCPFields() {
        let needsKoreanFields = false;
        if (this.props.koreanAuthenticationRequired) {
            needsKoreanFields = this.issuingCountryCode ? this.issuingCountryCode === 'kr' : this.props.countryCode === 'kr';
        }

        // Was korean, now isn't - hide password field
        if (this.state.hasKoreanFields && !needsKoreanFields) {
            // Clear any stored data
            const setRemovedFieldState = prevState => ({
                data: { ...prevState.data, [ENCRYPTED_PWD_FIELD]: undefined },
                valid: { ...prevState.valid, [ENCRYPTED_PWD_FIELD]: false },
                errors: { ...prevState.errors, [ENCRYPTED_PWD_FIELD]: false },
                hasKoreanFields: false
            });

            this.setState(setRemovedFieldState, () => {
                this.props.onChange(this.state);
            });

            this.csf.removeSecuredField(ENCRYPTED_PWD_FIELD);
            this.csf.setKCPStatus(false);
        }

        // Wasn't korean, now is - show password field
        if (!this.state.hasKoreanFields && needsKoreanFields) {
            const setAddedFieldState = prevState => ({
                valid: { ...prevState.valid, [ENCRYPTED_PWD_FIELD]: false },
                hasKoreanFields: true,
                isSfpValid: false
            });

            this.setState(setAddedFieldState, () => {
                this.props.onChange(this.state);
            });

            this.csf.addSecuredField(ENCRYPTED_PWD_FIELD);
            this.csf.setKCPStatus(true);
        }
    }

    public getChildContext(): object {
        return { i18n: this.props.i18n };
    }

    public handleUnsupportedCard(errObj: CbObjOnError): boolean {
        const hasUnsupportedCard = !!errObj.error;

        // Store the brand(s) we detected and which we don't support
        if (hasUnsupportedCard) {
            this.setState({ detectedUnsupportedBrands: errObj.detectedBrands });
        }

        errObj.rootNode = this.rootNode; // Needed for CustomCard
        this.handleOnError(errObj, hasUnsupportedCard);
        // Inform CSF that the number field has an unsupportedCard error (or that it has been cleared)
        if (this.csf) {
            this.csf.hasUnsupportedCard(ENCRYPTED_CARD_NUMBER, errObj.error);
        }
        return hasUnsupportedCard;
    }

    public setFocusOn(frame: string): void {
        if (this.csf) this.csf.setFocusOnFrame(frame);
    }

    public updateStyles(stylesObj: StylesObject): void {
        if (this.csf) this.csf.updateStyles(stylesObj);
    }

    public sfIsOptionalOrHidden(fieldType: string): boolean {
        return this.csf.sfIsOptionalOrHidden(fieldType);
    }

    public destroy(): void {
        if (this.csf) this.csf.destroy();
    }

    public showValidation(): void {
        const { numDateFields, state }: SecuredFieldsProvider = this;

        Object.keys(state.valid)
            .reduce(getErrorReducer(numDateFields, state), [])
            .forEach(field => {
                // For each detected error pass an error object to the handler (calls error callback & sets state)
                const errorObj: CbObjOnError = getErrorObject(field, this.rootNode, state);
                this.handleOnError(errorObj, !!state.detectedUnsupportedBrands);
                // Inform the secured-fields instance of which fields have been found to have errors
                if (this.csf && this.csf.isValidated) {
                    this.csf.isValidated(field, errorObj.error);
                }
            });
    }

    /**
     * Map SF errors to ValidationRuleResult-like objects, for CardInput component
     */
    public mapErrorsToValidationRuleResult(): SFStateErrorObj {
        const fieldNames: string[] = Object.keys(this.state.errors);

        const sfStateErrorsObj = fieldNames.reduce((acc, fieldName) => {
            const errorCode = this.state.errors[fieldName];
            if (errorCode) {
                acc[fieldName] = {
                    isValid: false,
                    errorMessage: getErrorMessageFromCode(errorCode, SF_ErrorCodes), // this is the human-readable, untranslated, explanation of the error that will exist on the error object in card.state.errors
                    // For v5 the object found in state.errors should also contain the additional properties that used to be sent to the onError callback
                    // namely: translation, errorCode, a ref to rootNode &, in the case of failed binLookup, an array of the detectedBrands
                    errorI18n: this.props.i18n.get(errorCode),
                    error: errorCode,
                    rootNode: this.rootNode,
                    ...(this.state.detectedUnsupportedBrands && { detectedBrands: this.state.detectedUnsupportedBrands })
                };
            } else {
                acc[fieldName] = null;
            }
            return acc;
        }, {});
        return sfStateErrorsObj;
    }

    public processBinLookupResponse(binLookupResponse: BinLookupResponse, resetObject: SingleBrandResetObject): void {
        // If we were dealing with an unsupported card & now we have a valid /binLookup response (or a response triggering a reset of the UI),
        // - reset state to clear the error & the stored unsupportedBrands and, in the case of a valid /binLookup response, inform CSF (via handleUnsupportedCard)
        // (Scenario: from an unsupportedCard state the shopper has pasted another number long enough to trigger a /binLookup)
        if (this.state.detectedUnsupportedBrands) {
            this.setState(prevState => ({
                errors: { ...prevState.errors, [ENCRYPTED_CARD_NUMBER]: false },
                detectedUnsupportedBrands: null
            }));

            // If we have some sort of binLookupResponse object then this isn't the reset caused by digits dropping below a threshold
            // - so call handleUnsupportedCard to clear the error
            if (this.csf && binLookupResponse) {
                const errObj: CbObjOnError = {
                    type: 'card',
                    fieldType: 'encryptedCardNumber',
                    error: ''
                };
                this.handleUnsupportedCard(errObj);
            }
        }

        this.issuingCountryCode = binLookupResponse?.issuingCountryCode?.toLowerCase();

        const hasBrandedResetObj = resetObject?.brand;

        /**
         * Are we dealing with a "dedicated" card scenario i.e a card component created as: checkout.create('bcmc') but which can accept multiple brands
         * - in which case we will need to reset brand and pass on the resetObj to CSF
         */
        const mustResetDedicatedBrand = hasBrandedResetObj && DEDICATED_CARD_COMPONENTS.includes(resetObject.brand);

        if (mustResetDedicatedBrand) {
            // resetObject.brand will be the value of the brand whose logo we want to reshow in the UI
            this.setState(resetObject, () => {
                this.props.onChange(this.state);
            });
        }

        /**
         * Scenarios:
         *
         * - RESET (binLookupResponse === null): The number of digits in number field has dropped below threshold for BIN lookup
         * - RESULT (binLookupResponse.supportedBrands.length === 1): binLookup has found a result so inform CSF
         *
         * In the RESET scenario, for "dedicated" card components we also need to pass on the resetObject since this contains information about
         * the brand that CSF needs to reset to, internally.
         */
        if (this.csf) this.csf.brandsFromBinLookup(binLookupResponse, mustResetDedicatedBrand ? resetObject : null);
    }

    private setRootNode = (input: HTMLElement): void => {
        this.rootNode = input;
    };

    public render(props, state) {
        return props.render({ setRootNode: this.setRootNode, setFocusOn: this.setFocusOn }, state);
    }
}

export default SecuredFieldsProvider;
