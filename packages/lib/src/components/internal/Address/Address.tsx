import { Fragment, h } from 'preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import Fieldset from '../FormFields/Fieldset';
import ReadOnlyAddress from './components/ReadOnlyAddress';
import { getAddressValidationRules } from './validate';
import { addressFormatters, countrySpecificFormatters } from './validate.formats';
import { AddressProps, AddressType } from './types';
import { AddressData } from '../../../types/global-types';
import FieldContainer from './components/FieldContainer';
import useForm from '../../../utils/useForm';
import Specifications from './Specifications';
import { ADDRESS_SCHEMA, COUNTRY, FALLBACK_VALUE } from './constants';
import { getMaxLengthByFieldAndCountry } from '../../../utils/validator-utils';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import AddressSearch from './components/AddressSearch';
import { ComponentMethodsRef } from '../UIElement/types';
import './Address.scss';
import { getAddressTypeFromLabel } from './utils';

const EMPTY_ADDRESS_DATA: Readonly<AddressData> = {};

export default function Address(props: Readonly<AddressProps>) {
    const { i18n } = useCoreContext();

    const { label = '', requiredFields, visibility, iOSFocusedField = null, showContextualElement } = props;
    const addressType: AddressType = getAddressTypeFromLabel(props.addressType, label);

    /** An object by which to expose 'public' members to the parent UIElement */
    const addressRef = useRef<ComponentMethodsRef>({});
    // Just call once
    if (!Object.keys(addressRef.current).length) {
        props.setComponentRef?.(addressRef.current);
    }

    const specifications = useMemo(() => new Specifications(props.specifications), [props.specifications]);

    const requiredFieldsSchema = specifications.getAddressSchemaForCountryFlat(props.countryCode).filter(field => requiredFields.includes(field));

    const [hasSelectedAddress, setHasSelectedAddress] = useState(false);

    const [useManualAddress, setUseManualAddress] = useState(false);

    const [searchErrorMessage, setSearchErrorMessage] = useState('');

    const showAddressSearch = !!props.onAddressLookup;

    const [ignoreCountryChange, setIgnoreCountryChange] = useState(false);

    const showAddressFields = props.onAddressLookup ? hasSelectedAddress || useManualAddress : true;

    // In partial address mode the country field is not rendered, so it is absent from the address schema.
    // The country the merchant configured must still be part of the form data for country dependent rules to be applied.
    const addressData = props.data ?? EMPTY_ADDRESS_DATA;
    const merchantCountry = addressData.country;
    const formSchema = merchantCountry && !requiredFieldsSchema.includes(COUNTRY) ? [...requiredFieldsSchema, COUNTRY] : requiredFieldsSchema;
    const defaultData = useMemo<AddressData>(
        () => (merchantCountry ? { ...addressData, country: merchantCountry.toUpperCase() } : addressData),
        [addressData, merchantCountry]
    );

    const { data, errors, valid, isValid, handleChangeFor, triggerValidation, setData, mergeData } = useForm<AddressData>({
        schema: formSchema,
        defaultData,
        // Ensure any passed validation rules are merged with the default ones
        rules: { ...getAddressValidationRules(specifications), ...props.validationRules },
        formatters: addressFormatters
    });

    const setSearchData = useCallback(
        (selectedAddress: AddressData) => {
            const propsKeysToProcess = ADDRESS_SCHEMA;
            const newStateData = propsKeysToProcess.reduce((acc: AddressData, propKey) => {
                // Make sure the data provided by the merchant is always strings
                const providedValue = selectedAddress[propKey];
                if (providedValue !== null && providedValue !== undefined) {
                    // Cast everything to string
                    acc[propKey] = String(providedValue);
                }
                return acc;
            }, {});
            mergeData(newStateData);
            setIgnoreCountryChange(true);
            triggerValidation();
            setHasSelectedAddress(true);
        },
        [setHasSelectedAddress, triggerValidation, setData]
    );

    const onManualAddress = useCallback(() => {
        setUseManualAddress(true);
    }, []);

    // Expose method expected by (parent) Address.tsx
    addressRef.current.showValidation = () => {
        triggerValidation();
        if (showAddressSearch && !showAddressFields && !isValid) {
            setSearchErrorMessage(i18n.get('address.errors.incomplete'));
        } else {
            setSearchErrorMessage('');
        }
    };

    /**
     * For iOS: iOSFocusedField is the name of the element calling for other elements to be disabled
     * - so if it is set (meaning we are in iOS *and* an input has been focussed) only enable the field that corresponds to this element
     */
    const enabledFields: string[] = requiredFieldsSchema.filter(item => {
        return !iOSFocusedField ? true : item === iOSFocusedField;
    });

    /**
     * Effect that:
     * - Resets validation for all fields by triggering handleChangeFor(fieldName, 'input')
     * - Applies validation on postalCode field in case it has any value
     */
    useEffect((): void => {
        // if the country was set via setSearchData we don't want to trigger this
        if (ignoreCountryChange) {
            setIgnoreCountryChange(false);
            return;
        }

        const country = data.country ?? '';
        const countryHasVisibleStateField =
            specifications.countryHasDataset(country) || specifications.countryHasFreeTextField(country, 'stateOrProvince');
        const stateOrProvince = countryHasVisibleStateField ? '' : FALLBACK_VALUE;
        const newData = { ...data, stateOrProvince };

        requiredFields.forEach(fieldName => {
            handleChangeFor(fieldName, 'input')(newData[fieldName] ?? '');
        });

        if (newData.postalCode) {
            handleChangeFor('postalCode', 'blur')(data.postalCode);
        }
    }, [data.country]);

    /**
     * Set the value of 'stateOrProvince' during the initial render if
     * property is provided during the creation of the payment method
     */
    useEffect((): void => {
        const stateFieldIsRequired = requiredFields.includes('stateOrProvince');
        const countryHasVisibleStateField =
            data.country &&
            (specifications.countryHasDataset(data.country) || specifications.countryHasFreeTextField(data.country, 'stateOrProvince'));
        const addressShouldHaveState = stateFieldIsRequired && countryHasVisibleStateField;
        const stateOrProvince = data.stateOrProvince || (addressShouldHaveState ? '' : FALLBACK_VALUE);

        handleChangeFor('stateOrProvince', 'input')(stateOrProvince);
    }, []);

    useEffect((): void => {
        const optionalFields = specifications.getOptionalFieldsForCountry(data.country);
        const processedData = ADDRESS_SCHEMA.reduce((acc, cur) => {
            const isOptional = optionalFields.includes(cur);
            const isRequired = requiredFields.includes(cur);
            const newValue = data[cur];
            const initialValue = defaultData[cur];
            // recover default data values which are not requiredFields, or prefill with 'N/A'
            const fallbackValue = !isRequired && initialValue ? initialValue : FALLBACK_VALUE;
            const value = (isOptional && !newValue) || !isRequired ? fallbackValue : newValue;
            if (value?.length) acc[cur] = value;
            return acc;
        }, {});

        props.onChange({ data: processedData, valid, errors, isValid });
    }, [data, valid, errors, isValid]);

    if (visibility === 'hidden') return null;
    if (visibility === 'readOnly') return <ReadOnlyAddress data={data} label={label} />;

    const getComponent = (fieldName: string, { classNameModifiers = [] }) => {
        if (!requiredFields.includes(fieldName)) return null;

        return (
            <FieldContainer
                key={fieldName}
                allowedCountries={props.allowedCountries}
                classNameModifiers={[...classNameModifiers, fieldName]}
                data={data}
                errors={errors}
                valid={valid}
                fieldName={fieldName}
                onInput={handleChangeFor(fieldName, 'input')}
                onBlur={handleChangeFor(fieldName, 'blur')}
                onDropdownChange={handleChangeFor(fieldName, 'blur')}
                specifications={specifications}
                maxLength={getMaxLengthByFieldAndCountry(countrySpecificFormatters, fieldName, data.country, true)}
                trimOnBlur={true}
                disabled={!enabledFields.includes(fieldName)}
                addressType={addressType}
                onFieldFocusAnalytics={props.onFieldFocusAnalytics}
                onFieldBlurAnalytics={props.onFieldBlurAnalytics}
            />
        );
    };

    const getWrapper = group => (
        <div className="adyen-checkout__field-group">
            {group.map(([field, size]) => getComponent(field, { classNameModifiers: [`col-${size}`] }))}
        </div>
    );

    const addressSchema = specifications.getAddressSchemaForCountry(data.country);

    return (
        <Fragment>
            <Fieldset classNameModifiers={[label, 'address']} label={label} renderLabelAsSectionHeading>
                {showAddressSearch && (
                    <AddressSearch
                        onAddressLookup={props.onAddressLookup}
                        onAddressSelected={props.onAddressSelected}
                        onSelect={setSearchData}
                        onManualAddress={onManualAddress}
                        externalErrorMessage={searchErrorMessage}
                        hideManualButton={showAddressFields}
                        showContextualElement={showContextualElement}
                        contextualText={i18n.get('address.search.contextualText')}
                        addressSearchDebounceMs={props.addressSearchDebounceMs}
                    />
                )}
                {showAddressFields && (
                    <Fragment>{addressSchema.map(field => (field instanceof Array ? getWrapper(field) : getComponent(field, {})))}</Fragment>
                )}
            </Fieldset>
        </Fragment>
    );
}

Address.defaultProps = {
    countryCode: null,
    validationRules: null,
    data: {},
    onChange: () => {},
    visibility: 'editable',
    requiredFields: ADDRESS_SCHEMA,
    specifications: {},
    onFieldFocusAnalytics: () => {},
    onFieldBlurAnalytics: () => {}
};
