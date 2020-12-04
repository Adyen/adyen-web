import { h } from 'preact';
import Field from '../../FormFields/Field';
import StateField from './StateField';
import CountryField from './CountryField';
import { renderFormField } from '../../FormFields';
import { getKeyForField } from '../utils';
import { FieldContainerProps } from '../types';
import useCoreContext from '../../../../core/Context/useCoreContext';

function FieldContainer(props: FieldContainerProps) {
    const { i18n } = useCoreContext();
    const { classNameModifiers = [], data, errors, fieldName, onInput } = props;
    const errorMessage = !!errors[fieldName];
    const value = data[fieldName];
    const labelKey = getKeyForField(fieldName, data.country);

    switch (fieldName) {
        case 'country':
            return (
                <CountryField
                    classNameModifiers={classNameModifiers}
                    allowedCountries={props.allowedCountries}
                    errorMessage={errorMessage}
                    onDropdownChange={props.onCountryChange}
                    value={value}
                />
            );
        case 'stateOrProvince':
            return (
                <StateField
                    classNameModifiers={classNameModifiers}
                    selectedCountry={data.country}
                    errorMessage={errorMessage}
                    onDropdownChange={props.onStateChange}
                    value={value}
                />
            );
        default:
            return (
                <Field label={i18n.get(labelKey)} classNameModifiers={classNameModifiers} errorMessage={errorMessage}>
                    {renderFormField('text', {
                        classNameModifiers,
                        name: fieldName,
                        value,
                        onInput
                    })}
                </Field>
            );
    }
}

export default FieldContainer;
