import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import Fieldset from '../FormFields/Fieldset';
import ReadOnlyAddress from './components/ReadOnlyAddress';
import StateField from './components/StateField';
import CountryField from './components/CountryField';
import { addressValidationRules } from './validate';
import Validator from '../../../utils/Validator';
import { getInitialData } from './utils';
import useCoreContext from '../../../core/Context/useCoreContext';
import { AddressProps, AddressStateError, AddressStateValid } from './types';
import { AddressSchema } from '../../../types';
import FieldContainer from './components/FieldContainer';
import { ADDRESS_SCHEMA, COUNTRIES_WITH_TWO_LINES_ADDRESSES, COUNTRIES_WITH_STATES_DATASET, COUNTRIES_WITH_HOUSE_NUMBER_FIRST } from './constants';

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
            {requiredFields.includes('country') && (
                <CountryField
                    value={data.country}
                    errorMessage={!!errors.country}
                    onDropdownChange={handleCountryChange}
                    allowedCountries={props.allowedCountries}
                />
            )}

            {requiredFields.includes('houseNumberOrName') && COUNTRIES_WITH_HOUSE_NUMBER_FIRST.includes(data.country) && (
                <FieldContainer
                    classNameModifiers={['col-30']}
                    data={data}
                    errors={errors}
                    fieldName="houseNumberOrName"
                    i18n={i18n}
                    onInput={handleChange}
                />
            )}

            {requiredFields.includes('street') && (
                <FieldContainer
                    classNameModifiers={[...(COUNTRIES_WITH_TWO_LINES_ADDRESSES.includes(data.country) ? [] : ['col-70'])]}
                    data={data}
                    errors={errors}
                    fieldName="street"
                    i18n={i18n}
                    onInput={handleChange}
                />
            )}

            {requiredFields.includes('houseNumberOrName') && !COUNTRIES_WITH_HOUSE_NUMBER_FIRST.includes(data.country) && (
                <FieldContainer
                    classNameModifiers={[...(COUNTRIES_WITH_TWO_LINES_ADDRESSES.includes(data.country) ? [] : ['col-30'])]}
                    data={data}
                    errors={errors}
                    fieldName="houseNumberOrName"
                    i18n={i18n}
                    onInput={handleChange}
                />
            )}

            <div className="adyen-checkout__field-group">
                {requiredFields.includes('city') && (
                    <FieldContainer
                        classNameModifiers={[...(COUNTRIES_WITH_STATES_DATASET.includes(data.country) ? [] : ['col-70'])]}
                        data={data}
                        errors={errors}
                        fieldName="city"
                        i18n={i18n}
                        onInput={handleChange}
                    />
                )}

                {requiredFields.includes('postalCode') && !COUNTRIES_WITH_STATES_DATASET.includes(data.country) && (
                    <FieldContainer
                        classNameModifiers={['col-30']}
                        data={data}
                        errors={errors}
                        fieldName="postalCode"
                        i18n={i18n}
                        onInput={handleChange}
                    />
                )}
            </div>

            {COUNTRIES_WITH_STATES_DATASET.includes(data.country) && (
                <div className="adyen-checkout__field-group">
                    {requiredFields.includes('stateOrProvince') && (
                        <StateField
                            value={data.stateOrProvince}
                            errorMessage={!!errors.stateOrProvince}
                            country={data.country}
                            onDropdownChange={handleStateChange}
                        />
                    )}

                    {requiredFields.includes('postalCode') && (
                        <FieldContainer
                            classNameModifiers={['col-30']}
                            data={data}
                            errors={errors}
                            fieldName="postalCode"
                            i18n={i18n}
                            onInput={handleChange}
                        />
                    )}
                </div>
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
