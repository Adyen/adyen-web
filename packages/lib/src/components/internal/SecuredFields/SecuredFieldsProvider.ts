import { Component } from 'preact';
import { getErrorObject, getFields, getErrorReducer, validFieldsReducer } from './utils';
import initCSF from './lib';
import handlers from './SecuredFieldsProviderHandlers';
import defaultProps, { SFPProps } from './defaultProps';
import {
    CSFReturnObject,
    SetupObject,
    StylesObject,
    BinLookupObject,
    CbObjOnError,
    CbObjOnFocus,
    CbObjOnBrand,
    CbObjOnAllValid,
    CbObjOnFieldValid,
    CbObjOnAutoComplete,
    CbObjOnConfigSuccess,
    CbObjOnLoad
} from './lib/types';
import { AddressSchema } from '../../../types';
import { ENCRYPTED_CARD_NUMBER, ENCRYPTED_PWD_FIELD } from './lib/configuration/constants';

export interface SFPState {
    status?: string;
    brand?: string;
    errors?: object;
    valid: object;
    data: object;
    cvcRequired?: boolean;
    isSfpValid?: boolean;
    autoCompleteName?: string;
    billingAddress?: AddressSchema;
    hasUnsupportedCard?: boolean;
    hasKoreanFields?: boolean;
}

/**
 * SecuredFieldsProvider:
 * Initialises & handles the client-side part of SecuredFields
 */
class SecuredFieldsProvider extends Component<SFPProps, SFPState> {
    private originKeyErrorTimeout: number;
    private originKeyTimeoutMS: number;
    private numCharsInCVC: number;
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
            cvcRequired: true,
            isSfpValid: false,
            hasKoreanFields: this.props.hasKoreanFields
        };
        this.state = stateObj;

        this.originKeyErrorTimeout = null;
        this.originKeyTimeoutMS = 15000;

        this.numCharsInCVC = 0;

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
        if (this.props.rootNode) {
            this.setRootNode(this.props.rootNode);
        }

        // Find encryptedFields and map them to the values we use to store valid states
        const fields = getFields(this.rootNode);
        const valid = fields.reduce(validFieldsReducer, {});

        this.setState({ valid });

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
    }

    private initializeCSF(root: HTMLElement): void {
        let loadingContext = this.props.loadingContext;

        // For loading securedFields from local server during development
        if (process.env.NODE_ENV === 'development' && process.env.__SF_ENV__ !== 'build') {
            loadingContext = process.env.__SF_ENV__;
        }

        const csfSetupObj: SetupObject = {
            rootNode: root,
            type: this.props.type,
            originKey: this.props.originKey,
            clientKey: this.props.clientKey,
            cardGroupTypes: this.props.groupTypes,
            allowedDOMAccess: this.props.allowedDOMAccess,
            autoFocus: this.props.autoFocus,
            trimTrailingSeparator: this.props.trimTrailingSeparator,
            loadingContext,
            keypadFix: this.props.keypadFix,
            showWarnings: this.props.showWarnings,
            iframeUIConfig: {
                sfStyles: this.props.styles,
                placeholders: this.props.placeholders,
                ariaConfig: this.props.ariaLabels
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
                onAdditionalSFRemoved: this.props.onAdditionalSFRemoved
            },
            isKCP: this.state.hasKoreanFields
        };

        this.csf = initCSF(csfSetupObj);
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
        this.handleOnError(errObj, hasUnsupportedCard);
        // Inform CSF that the number field has an unsupportedCard error
        if (this.csf) this.csf.hasUnsupportedCard(ENCRYPTED_CARD_NUMBER, errObj.error);
        return hasUnsupportedCard;
    }

    public setFocusOn(frame: string): void {
        if (this.csf) this.csf.setFocusOnFrame(frame);
    }

    public updateStyles(stylesObj: StylesObject): void {
        if (this.csf) this.csf.updateStyles(stylesObj);
    }

    public destroy(): void {
        if (this.csf) this.csf.destroy();
    }

    public showValidation(): void {
        const { numDateFields, props, state }: SecuredFieldsProvider = this;

        Object.keys(state.valid)
            .reduce(getErrorReducer(numDateFields, state), [])
            .forEach(field => {
                // For each detected error pass an error object to the handler (calls error callback & sets state)
                const errorObj: CbObjOnError = getErrorObject(field, props.rootNode, state);
                this.handleOnError(errorObj);
                // Inform the secured-fields instance of which fields have been found to have errors
                if (this.csf && this.csf.isValidated) {
                    this.csf.isValidated(field, errorObj.error);
                }
            });
    }

    public processBinLookupResponse(binValueObject: BinLookupObject): void {
        // If we were dealing with an unsupported card and now we have a valid /binLookup response - reset state and inform CSF
        // (Scenario: from an unsupportedCard state the shopper has pasted another number long enough to trigger a /binLookup)
        if (this.state.hasUnsupportedCard) {
            this.setState(prevState => ({
                errors: { ...prevState.errors, [ENCRYPTED_CARD_NUMBER]: false },
                hasUnsupportedCard: false
            }));
            if (this.csf) this.csf.hasUnsupportedCard(ENCRYPTED_CARD_NUMBER, '');
        }

        this.issuingCountryCode = binValueObject?.issuingCountryCode?.toLowerCase();

        // Scenarios:
        // RESET (binValueObject === null): The number of digits in number field has dropped below threshold for BIN lookup
        // RESULT (binValueObject.brands.length === 1): binLookup has found a result so inform CSF
        if (this.csf) this.csf.brandsFromBinLookup(binValueObject);
    }

    private setRootNode = (input: HTMLElement): void => {
        this.rootNode = input;
    };

    public render(props, state) {
        return props.render({ setRootNode: this.setRootNode, setFocusOn: this.setFocusOn }, state);
    }
}

export default SecuredFieldsProvider;
