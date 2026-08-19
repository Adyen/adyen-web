import { h, Ref } from 'preact';
import { useState, useEffect, useRef, useMemo } from 'preact/hooks';
import Language from '../../../language/Language';
import SecuredFieldsProvider from '../../internal/SecuredFields/SFP/SecuredFieldsProvider';
import { SFPState } from '../../internal/SecuredFields/SFP/types';
import { BinLookupResponse, CardBrandsConfiguration, CardPlaceholders } from '../../Card/types';
import SFExtensions from '../../internal/SecuredFields/binLookup/extensions';
import {
    CardAllValidData,
    CardAutoCompleteData,
    CardBinValueData,
    CardBrandData,
    CardConfigSuccessData,
    CardFieldValidData,
    CardFocusData,
    CardLoadData,
    CardErrorData,
    SFFieldType,
    StylesObject
} from '../../internal/SecuredFields/lib/types';
import { Resources } from '../../../core/Context/Resources';
import { SFError } from '../../Card/components/CardInput/types';
import { ValidationError } from '../types';
import type { AbstractAnalyticsEvent } from '../../../core/Analytics/events/AbstractAnalyticsEvent';
import type AdyenCheckoutError from '../../../core/Errors/AdyenCheckoutError';
import type UIElement from '../../internal/UIElement';
import type { ComponentMethodsRef } from '../../internal/UIElement/types';

/**
 * Methods that CustomCardInput exposes to the CustomCard element through the ref
 */
export interface CustomCardInputRef extends ComponentMethodsRef {
    processBinLookupResponse(binLookupResponse: BinLookupResponse, isReset?: boolean): void;
    dualBrandingChangeHandler(event: Event | string): void;
    setFocusOn(frame: SFFieldType): void;
    updateStyles(stylesObj: StylesObject): void;
    handleUnsupportedCard(errObj: CardErrorData): boolean;
}

interface SecuredFieldsProps {
    autoFocus?: boolean;
    brand?: string;
    brands?: string[];
    brandsConfiguration?: CardBrandsConfiguration;
    clientKey?: string;
    countryCode?: string;
    forceCompat?: boolean;
    i18n?: Language;
    implementationType?: 'components' | 'custom';
    keypadFix?: boolean;
    loadingContext?: string;
    legacyInputMode?: boolean;
    minimumExpiryDate?: string;
    onAdditionalSFConfig?: () => void;
    onAdditionalSFRemoved?: () => void;
    onAllValid?: (data: CardAllValidData) => void;
    onAutoComplete?: (data: CardAutoCompleteData) => void;
    onBinValue?: (data: CardBinValueData) => void;
    onBrand?: (data: CardBrandData) => void;
    onConfigSuccess?: (data: CardConfigSuccessData) => void;
    onChange?: (data) => void;
    onSubmitAnalytics?: (event: AbstractAnalyticsEvent) => void;
    handleKeyDown?: (event: KeyboardEvent) => void;
    onError?: (error: AdyenCheckoutError, component?: UIElement) => void;
    onFieldValid?: (data: CardFieldValidData) => void;
    onFocus?: (data: CardFocusData) => void;
    onLoad?: (data: CardLoadData) => void;
    placeholders?: CardPlaceholders;
    rootNode?: HTMLElement;
    resources?: Resources;
    showWarnings?: boolean;
    styles?: StylesObject;
    trimTrailingSeparator?: boolean;
    type?: string;
    maskSecurityCode?: boolean;
    ref?: Ref<CustomCardInputRef>;
}

const defaultProps = {
    onChange: () => {},
    onError: () => {},
    onValidationError: () => {}
};

function CustomCardInput(props: Readonly<SecuredFieldsProps>) {
    const sfp = useRef(null);

    const [errors, setErrors] = useState({});
    const [valid, setValid] = useState({});
    const [data, setData] = useState({});

    const [isSfpValid, setIsSfpValid] = useState(false);

    const [issuingCountryCode, setIssuingCountryCode] = useState(null);

    const [dualBrandSelectElements, setDualBrandSelectElements] = useState([]);
    const [selectedBrandValue, setSelectedBrandValue] = useState('');

    const handleSecuredFieldsChange = (sfState: SFPState): void => {
        setData({ ...data, ...sfState.data });
        setErrors({ ...errors, ...sfState.errors });
        setValid({ ...valid, ...sfState.valid });

        setIsSfpValid(sfState.isSfpValid);
    };

    // Farm the handlers for binLookup related functionality out to another 'extensions' file
    const extensions = useMemo(
        () =>
            SFExtensions(
                props,
                { sfp },
                { dualBrandSelectElements, setDualBrandSelectElements, setSelectedBrandValue, issuingCountryCode, setIssuingCountryCode }
            ),
        [dualBrandSelectElements, issuingCountryCode]
    );

    /**
     * EXPECTED METHODS ON SecuredFields.this
     */
    this.processBinLookupResponse = (binLookupResponse: BinLookupResponse, isReset: boolean) => {
        extensions.processBinLookup(binLookupResponse, isReset);
    };

    this.dualBrandingChangeHandler = extensions.handleDualBrandSelection;

    useEffect(() => {
        this.setFocusOn = sfp.current.setFocusOn;
        this.updateStyles = sfp.current.updateStyles;
        this.showValidation = sfp.current.showValidation;
        this.handleUnsupportedCard = sfp.current.handleUnsupportedCard;

        return () => {
            sfp.current.destroy();
        };
    }, []);

    useEffect(() => {
        const sfStateErrorsObj = sfp.current.mapErrorsToValidationRuleResult();

        const mappedErrors = { ...errors, ...sfStateErrorsObj }; // maps sfErrors

        props.onChange({
            data,
            valid,
            errors: mappedErrors,
            isValid: isSfpValid,
            selectedBrandValue
        });

        // Create an array of Validation error objects and send to callback
        if (Object.keys(mappedErrors).length) {
            const validationErrors: ValidationError[] = Object.entries(mappedErrors).map(([fieldType, error]) => {
                const valErr: ValidationError = {
                    fieldType,
                    ...(error ? (error as SFError) : { error: '', rootNode: this.props.rootNode })
                };
                return valErr;
            });
            this.props.onValidationError?.(validationErrors);
        }
    }, [data, valid, errors, selectedBrandValue]);

    return (
        <SecuredFieldsProvider
            ref={sfp}
            {...extractPropsForSFP(props)}
            type={props.brand}
            componentType={props.type}
            onChange={handleSecuredFieldsChange}
            onSubmitAnalytics={props.onSubmitAnalytics}
            exposeExpiryDate={false}
            disableIOSArrowKeys={null}
            render={() => null}
        />
    );
}

CustomCardInput.defaultProps = defaultProps;

export default CustomCardInput;

const extractPropsForSFP = (props: SecuredFieldsProps) => {
    return {
        autoFocus: props.autoFocus,
        brands: props.brands,
        brandsConfiguration: props.brandsConfiguration,
        clientKey: props.clientKey,
        forceCompat: props.forceCompat,
        i18n: props.i18n,
        implementationType: props.implementationType,
        keypadFix: props.keypadFix,
        legacyInputMode: props.legacyInputMode,
        loadingContext: props.loadingContext,
        minimumExpiryDate: props.minimumExpiryDate,
        onAdditionalSFConfig: props.onAdditionalSFConfig,
        onAdditionalSFRemoved: props.onAdditionalSFRemoved,
        onAllValid: props.onAllValid,
        onAutoComplete: props.onAutoComplete,
        onBinValue: props.onBinValue,
        onBrand: props.onBrand,
        onConfigSuccess: props.onConfigSuccess,
        handleKeyDown: props.handleKeyDown,
        onError: props.onError,
        onFieldValid: props.onFieldValid,
        onFocus: props.onFocus,
        onLoad: props.onLoad,
        rootNode: props.rootNode,
        showWarnings: props.showWarnings,
        styles: props.styles,
        trimTrailingSeparator: props.trimTrailingSeparator,
        resources: props.resources,
        maskSecurityCode: props.maskSecurityCode,
        placeholders: props.placeholders
    };
};
