import { h } from 'preact';
import { useState, useEffect, useRef, useMemo } from 'preact/hooks';
import Language from '../../../language/Language';
import SecuredFieldsProvider from '../../internal/SecuredFields/SFP/SecuredFieldsProvider';
import { SFPState } from '../../internal/SecuredFields/SFP/types';
import { BinLookupResponse, CardBrandsConfiguration } from '../../Card/types';
import SFExtensions from '../../internal/SecuredFields/binLookup/extensions';
import { StylesObject } from '../../internal/SecuredFields/lib/types';
import { Resources } from '../../../core/Context/Resources';
import { Placeholders } from '../../Card/components/CardInput/types';

interface SecuredFieldsProps {
    allowedDOMAccess?: boolean;
    autoFocus?: boolean;
    brands?: string[];
    brandsConfiguration?: CardBrandsConfiguration;
    clientKey?: string;
    countryCode?: string;
    i18n: Language;
    implementationType?: string;
    keypadFix?: boolean;
    loadingContext?: string;
    legacyInputMode?: boolean;
    minimumExpiryDate?: string;
    onAdditionalSFConfig?: () => {};
    onAdditionalSFRemoved?: () => {};
    onAllValid?: () => {};
    onAutoComplete?: () => {};
    onBinValue?: () => {};
    onBrand?: () => {};
    onConfigSuccess?: () => {};
    onChange: (data) => void;
    onError?: () => {};
    onFieldValid?: () => {};
    onFocus?: (e) => {};
    onLoad?: () => {};
    placeholders?: Placeholders;
    rootNode: HTMLElement;
    resources: Resources;
    showWarnings?: boolean;
    styles?: StylesObject;
    trimTrailingSeparator?: boolean;
    type: string;
    maskSecurityCode?: boolean;
}

const defaultProps = {
    onChange: () => {},
    onError: () => {}
};

function CustomCardInput(props: SecuredFieldsProps) {
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

    /**
     * EFFECT HOOKS
     */
    useEffect(() => {
        // componentDidMount
        this.setFocusOn = sfp.current.setFocusOn;
        this.updateStyles = sfp.current.updateStyles;
        this.showValidation = sfp.current.showValidation;
        this.handleUnsupportedCard = sfp.current.handleUnsupportedCard;

        // componentWillUnmount
        return () => {
            sfp.current.destroy();
        };
    }, []);

    /**
     * Main 'componentDidUpdate' handler
     */
    useEffect(() => {
        const sfStateErrorsObj = sfp.current.mapErrorsToValidationRuleResult();

        props.onChange({
            data,
            valid,
            errors: { ...errors, ...sfStateErrorsObj }, // maps sfErrors
            isValid: isSfpValid,
            selectedBrandValue
        });
    }, [data, valid, errors, selectedBrandValue]);

    /**
     * RENDER
     */
    return <SecuredFieldsProvider ref={sfp} {...extractPropsForSFP(props)} onChange={handleSecuredFieldsChange} render={() => null} />;
}

CustomCardInput.defaultProps = defaultProps;

export default CustomCardInput;

const extractPropsForSFP = (props: SecuredFieldsProps) => {
    return {
        allowedDOMAccess: props.allowedDOMAccess,
        autoFocus: props.autoFocus,
        brands: props.brands,
        brandsConfiguration: props.brandsConfiguration,
        clientKey: props.clientKey,
        // countryCode: props.countryCode, // only used for korean cards when koreanAuthenticationRequired is true
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
        // onChange // set directly
        onConfigSuccess: props.onConfigSuccess,
        onError: props.onError,
        onFieldValid: props.onFieldValid,
        onFocus: props.onFocus,
        onLoad: props.onLoad,
        // render // set directly
        rootNode: props.rootNode,
        showWarnings: props.showWarnings,
        styles: props.styles,
        trimTrailingSeparator: props.trimTrailingSeparator,
        type: props.type,
        resources: props.resources,
        maskSecurityCode: props.maskSecurityCode,
        placeholders: props.placeholders
    };
};
