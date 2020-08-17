import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import Fieldset from '../FormFields/Fieldset';
import Field from '../FormFields/Field';
import ReadOnlyAddress from './components/ReadOnlyAddress';
import StateField from './components/StateField';
import CountryField from './components/CountryField';
import { renderFormField } from '../FormFields';
import { addressValidationRules } from './validate';
import Validator from '../../../utils/Validator';
import { getInitialData } from './utils';
import useCoreContext from '../../../core/Context/useCoreContext';
import { ADDRESS_SCHEMA, COUNTRIES_WITH_STATES_DATASET } from './constants';
import { AddressProps, AddressStateError, AddressStateValid } from './types';
import { AddressSchema } from '../../../types';

export default function Address(props: AddressProps) {
    const { label = '', requiredFields, visibility } = props;
    const validator = new Validator(addressValidationRules);

    const { i18n } = useCoreContext();
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

    return (
        <Fieldset classNameModifiers={[label]} label={label}>
            {requiredFields.includes('street') && (
                <Field
                    label={i18n.get('street')}
                    classNameModifiers={[...(requiredFields.includes('houseNumberOrName') ? ['col-70'] : []), 'street']}
                    errorMessage={!!errors.street}
                >
                    {renderFormField('text', {
                        name: 'street',
                        value: data.street,
                        classNameModifiers: ['street'],
                        onInput: handleChange
                    })}
                </Field>
            )}

            {requiredFields.includes('houseNumberOrName') && (
                <Field
                    label={i18n.get('houseNumberOrName')}
                    classNameModifiers={['col-30', 'houseNumberOrName']}
                    errorMessage={!!errors.houseNumberOrName}
                >
                    {renderFormField('text', {
                        name: 'houseNumberOrName',
                        value: data.houseNumberOrName,
                        classNameModifiers: ['houseNumberOrName'],
                        onInput: handleChange
                    })}
                </Field>
            )}

            <div className="adyen-checkout__field-group">
                {requiredFields.includes('postalCode') && (
                    <Field label={i18n.get('postalCode')} classNameModifiers={['postalCode', 'col-30']} errorMessage={!!errors.postalCode}>
                        {renderFormField('text', {
                            name: 'postalCode',
                            value: data.postalCode,
                            classNameModifiers: ['postalCode'],
                            onInput: handleChange
                        })}
                    </Field>
                )}

                {requiredFields.includes('city') && (
                    <Field label={i18n.get('city')} classNameModifiers={['city', 'col-70']} errorMessage={!!errors.city}>
                        {renderFormField('text', {
                            name: 'city',
                            value: data.city,
                            classNameModifiers: ['city'],
                            onInput: handleChange
                        })}
                    </Field>
                )}
            </div>

            {requiredFields.includes('country') && (
                <CountryField
                    value={data.country}
                    errorMessage={!!errors.country}
                    onDropdownChange={handleCountryChange}
                    allowedCountries={props.allowedCountries}
                />
            )}

            {requiredFields.includes('stateOrProvince') && (
                <StateField
                    value={data.stateOrProvince}
                    errorMessage={!!errors.stateOrProvince}
                    country={data.country}
                    onDropdownChange={handleStateChange}
                />
            )}
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
