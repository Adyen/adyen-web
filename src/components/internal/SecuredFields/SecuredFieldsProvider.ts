import { Component } from 'preact';
import { getErrorObject, getFields, getErrorReducer, validFieldsReducer, resolvePlaceholders } from './utils';
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

    constructor(props: SFPProps) {
        super(props);

        const stateObj: SFPState = {
            status: 'loading',
            brand: props.type,
            errors: {},
            valid: {},
            data: {},
            cvcRequired: true,
            isSfpValid: false
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
            this.initializeCSF(this.rootNode);
        } else {
            this.handleOnNoDataRequired();
        }
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

        console.log('\n#################################################');
        console.log('### SecuredFieldsProvider::initializeCSF:: this.props.type', this.props.type);
        console.log('### SecuredFieldsProvider::initializeCSF:: this.props.ariaLabels', this.props.ariaLabels);

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
                placeholders: {
                    ...resolvePlaceholders(this.props.i18n),
                    ...this.props.placeholders
                },
                ariaConfig: this.props.ariaLabels
            },
            callbacks: {
                onLoad: this.handleOnLoad,
                onConfigSuccess: this.handleOnConfigSuccess,
                onFieldValid: this.handleOnFieldValid,
                onAllValid: this.handleOnAllValid,
                onBrand: this.handleOnBrand,
                onError: this.handleOnError,
                onFocus: this.handleFocus,
                onBinValue: this.props.onBinValue,
                onAutoComplete: this.handleOnAutoComplete
            },
            isKCP: this.props.koreanAuthenticationRequired === true
        };

        this.csf = initCSF(csfSetupObj);
    }

    public getChildContext(): object {
        return { i18n: this.props.i18n };
    }

    public handleUnsupportedCard(errObj: CbObjOnError): boolean {
        const hasUnsupportedCard = !!errObj.error;
        this.handleOnError(errObj, hasUnsupportedCard);
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
                this.handleOnError(getErrorObject(field, props.rootNode, state));
                // Inform the secured-fields instance of which fields have been found to have errors
                if (this.csf && this.csf.isValidated) {
                    this.csf.isValidated(field);
                }
            });
    }

    public processBinLookupResponse(binValueObject: BinLookupObject): void {
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
