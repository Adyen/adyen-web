import { h } from 'preact';
import { useEffect, useMemo } from 'preact/hooks';
import Fieldset from '../FormFields/Fieldset';
import ReadOnlyAddress from './components/ReadOnlyAddress';
import { getAddressValidationRules } from './validate';
import { addressFormatters, countrySpecificFormatters } from './validate.formats';
import { AddressProps } from './types';
import { AddressData } from '../../../types';
import FieldContainer from './components/FieldContainer';
import useForm from '../../../utils/useForm';
import Specifications from './Specifications';
import { ADDRESS_SCHEMA, FALLBACK_VALUE } from './constants';
import { getMaxLengthByFieldAndCountry } from '../../../utils/validator-utils';

export default function Address(props: AddressProps) {
    const { label = '', requiredFields, visibility, iOSFocusedField = null } = props;
    const specifications = useMemo(() => new Specifications(props.specifications), [props.specifications]);

    const requiredFieldsSchema = specifications.getAddressSchemaForCountryFlat(props.countryCode).filter(field => requiredFields.includes(field));

    const { data, errors, valid, isValid, handleChangeFor, triggerValidation } = useForm<AddressData>({
        schema: requiredFieldsSchema,
        defaultData: props.data,
        rules: props.validationRules || getAddressValidationRules(specifications),
        formatters: addressFormatters
    });

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
        const stateOrProvince = specifications.countryHasDataset(data.country) ? '' : FALLBACK_VALUE;
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
        const countryHasStatesDataset = data.country && specifications.countryHasDataset(data.country);
        const addressShouldHaveState = stateFieldIsRequired && countryHasStatesDataset;
        const stateOrProvince = data.stateOrProvince || (addressShouldHaveState ? '' : FALLBACK_VALUE);

        handleChangeFor('stateOrProvince', 'input')(stateOrProvince);
    }, []);

    useEffect((): void => {
        const optionalFields = specifications.getOptionalFieldsForCountry(data.country);
        const processedData = ADDRESS_SCHEMA.reduce((acc, cur) => {
            const isOptional = optionalFields.includes(cur);
            const isRequired = requiredFields.includes(cur);
            const newValue = data[cur];
            const initialValue = props.data[cur];
            // recover default data values which are not requiredFields, or prefill with 'N/A'
            const fallbackValue = !isRequired && !newValue && !!initialValue ? initialValue : FALLBACK_VALUE;
            const value = (isOptional && !newValue) || !isRequired ? fallbackValue : newValue;
            if (value?.length) acc[cur] = value;
            return acc;
        }, {});

        props.onChange({ data: processedData, valid, errors, isValid });
    }, [data, valid, errors, isValid]);

    this.showValidation = triggerValidation;

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
                maxlength={getMaxLengthByFieldAndCountry(countrySpecificFormatters, fieldName, data.country, true)}
                trimOnBlur={true}
                disabled={!enabledFields.includes(fieldName)}
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
        <Fieldset classNameModifiers={[label]} label={label}>
            {addressSchema.map(field => (field instanceof Array ? getWrapper(field) : getComponent(field, {})))}
        </Fieldset>
    );
}

Address.defaultProps = {
    countryCode: null,
    validationRules: null,
    data: {},
    onChange: () => {},
    visibility: 'editable',
    requiredFields: ADDRESS_SCHEMA,
    specifications: {}
};
