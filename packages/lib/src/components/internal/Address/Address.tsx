import { h } from 'preact';
import { useEffect, useMemo } from 'preact/hooks';
import Fieldset from '../FormFields/Fieldset';
import ReadOnlyAddress from './components/ReadOnlyAddress';
import { getAddressValidationRules } from './validate';
import { AddressProps } from './types';
import { AddressData } from '../../../types';
import FieldContainer from './components/FieldContainer';
import useForm from '../../../utils/useForm';
import Specifications from './Specifications';
import { ADDRESS_SCHEMA } from './constants';

export default function Address(props: AddressProps) {
    const { label = '', requiredFields, visibility } = props;
    const specifications = useMemo(() => new Specifications(props.specifications), [props.specifications]);

    const { data, errors, valid, isValid, handleChangeFor, triggerValidation } = useForm<AddressData>({
        schema: requiredFields,
        defaultData: props.data,
        rules: props.validationRules || getAddressValidationRules(specifications)
    });

    useEffect((): void => {
        const stateOrProvince = specifications.countryHasDataset(data.country) ? '' : 'N/A';

        handleChangeFor('stateOrProvince', 'input')(stateOrProvince);
    }, [data.country]);

    useEffect((): void => {
        const stateFieldIsRequired = requiredFields.includes('stateOrProvince');
        const countryHasStatesDataset = data.country && specifications.countryHasDataset(data.country);
        const addressShouldHaveState = stateFieldIsRequired && countryHasStatesDataset;
        const stateOrProvince = data.stateOrProvince || (addressShouldHaveState ? '' : 'N/A');

        handleChangeFor('stateOrProvince', 'input')(stateOrProvince);
    }, []);

    useEffect((): void => {
        const processedData = ADDRESS_SCHEMA.reduce((acc, cur) => {
            // recover default data values which are not requiredFields, or prefill with 'N/A'
            const fallbackValue = !requiredFields.includes(cur) && !data[cur] && props.data[cur] ? props.data[cur] : 'N/A';
            return { ...acc, [cur]: requiredFields.includes(cur) || !!data[cur] ? data[cur] : fallbackValue };
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
                fieldName={fieldName}
                onInput={handleChangeFor(fieldName, 'input')}
                onDropdownChange={handleChangeFor(fieldName, 'blur')}
                specifications={specifications}
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
    data: {},
    onChange: () => {},
    visibility: 'editable',
    requiredFields: ADDRESS_SCHEMA,
    specifications: {}
};
