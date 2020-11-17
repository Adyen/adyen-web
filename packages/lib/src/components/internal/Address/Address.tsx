import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import Fieldset from '../FormFields/Fieldset';
import ReadOnlyAddress from './components/ReadOnlyAddress';
import { addressValidationRules } from './validate';
import Validator from '../../../utils/Validator';
import { getAddressSchemaForCountry, getInitialData } from './utils';
import { AddressProps, AddressStateError, AddressStateValid } from './types';
import { AddressSchema } from '../../../types';
import FieldContainer from './components/FieldContainer';
import { ADDRESS_SCHEMA, COUNTRIES_WITH_STATES_DATASET } from './constants';

export default function Address(props: AddressProps) {
    const { label = '', requiredFields, visibility } = props;
    const validator = new Validator(addressValidationRules);

    const [data, setData] = useState<AddressSchema>(getInitialData(props.data, requiredFields));
    const [errors, setErrors] = useState<AddressStateError>({});
    const [valid, setValid] = useState<AddressStateValid>({});

    const handleChange = (e: Event): void => {
        const { name, value } = e.target as HTMLInputElement;
        const isValid = validator.validate(name, 'blur')(value);

        setData(prevData => ({ ...prevData, [name]: value }));
        setValid(prevValid => ({ ...prevValid, [name]: isValid }));
        setErrors(prevErrors => ({ ...prevErrors, [name]: !isValid }));
    };

    const handleStateChange = (e: Event): void => {
        const field = e.currentTarget as HTMLInputElement;
        const value = field.getAttribute('data-value');

        setData(prevData => ({ ...prevData, stateOrProvince: value }));
        setValid(prevValid => ({ ...prevValid, stateOrProvince: !!value }));
        setErrors(prevErrors => ({ ...prevErrors, stateOrProvince: !value }));
    };

    const handleCountryChange = (e: Event): void => {
        const field = e.currentTarget as HTMLInputElement;
        const value = field.getAttribute('data-value');
        const stateOrProvince = COUNTRIES_WITH_STATES_DATASET.includes(value) ? '' : 'N/A';

        setData(prevData => ({ ...prevData, stateOrProvince, country: value }));
        setValid(prevValid => ({ ...prevValid, country: !!value }));
        setErrors(prevErrors => ({ ...prevErrors, country: !value }));
    };

    useEffect((): void => {
        const stateFieldIsRequired = requiredFields.includes('stateOrProvince');
        const countryHasStatesDataset = data.country && COUNTRIES_WITH_STATES_DATASET.includes(data.country);
        const addressShouldHaveState = stateFieldIsRequired && countryHasStatesDataset;
        const stateOrProvince = data.stateOrProvince || (addressShouldHaveState ? '' : 'N/A');

        setData(prevData => ({ ...prevData, stateOrProvince }));
    }, []);

    useEffect((): void => {
        const isValid: boolean = requiredFields.every(field => validator.validate(field, 'blur')(data[field]));

        props.onChange({ data, isValid });
    }, [data, valid, errors]);

    this.showValidation = (): void => {
        const errorsReducer = (acc, cur) => {
            acc[cur] = !validator.validate(cur, 'blur')(data[cur]);
            return acc;
        };

        setErrors(requiredFields.reduce(errorsReducer, {}));
    };

    if (visibility === 'hidden') return null;
    if (visibility === 'readOnly') return <ReadOnlyAddress data={data} label={label} />;

    const getComponent = (fieldName: string, { classNameModifiers = [] }) => {
        if (!requiredFields.includes(fieldName)) return null;

        return (
            <FieldContainer
                allowedCountries={props.allowedCountries}
                classNameModifiers={[...classNameModifiers, fieldName]}
                data={data}
                errors={errors}
                fieldName={fieldName}
                onInput={handleChange}
                onStateChange={handleStateChange}
                onCountryChange={handleCountryChange}
            />
        );
    };

    const getWrapper = group => (
        <div className="adyen-checkout__field-group">
            {group.map(([field, size]) => getComponent(field, { classNameModifiers: [`col-${size}`] }))}
        </div>
    );

    const addressSchema = getAddressSchemaForCountry(data.country);

    return (
        <Fieldset classNameModifiers={[label]} label={label}>
            {addressSchema.map(field => (field instanceof Array ? getWrapper(field) : getComponent(field, {})))}
        </Fieldset>
    );
}

Address.defaultProps = {
    data: {},
    onChange: () => {},
    visibility: 'editable',
    requiredFields: ADDRESS_SCHEMA,
    countryCode: null
};
