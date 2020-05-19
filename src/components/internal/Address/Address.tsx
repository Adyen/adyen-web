import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import Fieldset from '../FormFields/Fieldset';
import Field from '../FormFields/Field';
import ReadOnlyAddress from './components/ReadOnlyAddress';
import StateField from './components/StateField';
import CountryField from './components/CountryField';
import { renderFormField } from '../FormFields';
import { addressValidationRules } from './validate';
import Validator from '~/utils/Validator';
import useCoreContext from '~/core/Context/useCoreContext';
import { COUNTRIES_WITH_STATES_DATASET } from '~/components/internal/Address/constants';

export type RtnType_ParamVoidFn = (e) => void;

interface AddressObject {
    city: string;
    country: boolean | string;
    houseNumberOrName: string;
    postalCode: string;
    street: string;
    stateOrProvince: boolean | string;
}

export interface BillingAddress {
    data: AddressObject;
    isValid: boolean;
}

interface AddressProps {
    allowedCountries?: string[];
    countryCode?: string;
    data?: object;
    label?: string;
    onChange: Function;
    requiredFields?: string[];
    ref?: any;
    visibility?: string;
}

const addressSchema = ['street', 'houseNumberOrName', 'postalCode', 'city', 'stateOrProvince', 'country'];

export default function Address(props: AddressProps) {
    const { i18n } = useCoreContext();
    const { label = '', requiredFields, visibility } = props;
    const validator = new Validator(addressValidationRules);
    const addressReducer = (acc, cur: string) => {
        acc[cur] = props.data[cur] || (requiredFields.includes(cur) ? '' : 'N/A');
        return acc;
    };
    const [data, setData] = useState(addressSchema.reduce(addressReducer, {}));
    const [errors, setErrors] = useState(({} as any) as AddressObject);
    const [valid, setValid] = useState({});

    const handleChange: RtnType_ParamVoidFn = (e: Event): void => {
        const { name, value } = e.target as HTMLInputElement;
        const isValid = validator.validate(name, 'blur')(value);

        setData(data => ({ ...data, [name]: value }));
        setValid(valid => ({ ...valid, [name]: isValid }));
        setErrors(errors => ({ ...errors, [name]: !isValid }));
    };

    const handleStateChange: RtnType_ParamVoidFn = (e: Event): void => {
        const field = e.currentTarget as HTMLInputElement;
        const value = field.getAttribute('data-value');

        setData(data => ({ ...data, stateOrProvince: value }));
        setValid(valid => ({ ...valid, stateOrProvince: !!value }));
        setErrors(errors => ({ ...errors, stateOrProvince: !value }));
    };

    const handleCountryChange: RtnType_ParamVoidFn = (e: Event): void => {
        const field = e.currentTarget as HTMLInputElement;
        const value = field.getAttribute('data-value');
        const stateOrProvince = COUNTRIES_WITH_STATES_DATASET.includes(value) ? '' : 'N/A';

        setData(data => ({ ...data, stateOrProvince, country: value }));
        setValid(valid => ({ ...valid, country: !!value }));
        setErrors(errors => ({ ...errors, country: !value }));
    };

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
                    classNameModifiers={[...(requiredFields.includes('houseNumberOrName') && ['col-70']), 'street']}
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
    requiredFields: addressSchema,
    countryCode: null
};
