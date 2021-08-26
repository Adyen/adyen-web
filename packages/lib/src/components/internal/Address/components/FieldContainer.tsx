import { h } from 'preact';
import Field from '../../FormFields/Field';
import StateField from './StateField';
import CountryField from './CountryField';
import { renderFormField } from '../../FormFields';
import { FieldContainerProps } from '../types';
import useCoreContext from '../../../../core/Context/useCoreContext';

function FieldContainer(props: FieldContainerProps) {
    const { i18n } = useCoreContext();
    const { classNameModifiers = [], data, errors, fieldName, onInput } = props;
    const errorMessage = !!errors[fieldName];
    const value: string = data[fieldName];
    const selectedCountry: string = data.country;
    const isOptional: boolean = props.specifications.countryHasOptionalField(selectedCountry, fieldName);
    const labelKey: string = props.specifications.getKeyForField(fieldName, selectedCountry);
    const optionalLabel = isOptional ? ` ${i18n.get('field.title.optional')}` : '';
    const label = `${i18n.get(labelKey)}${optionalLabel}`;

    switch (fieldName) {
        case 'country':
            return (
                <CountryField
                    allowedCountries={props.allowedCountries}
                    classNameModifiers={classNameModifiers}
                    label={label}
                    errorMessage={errorMessage}
                    onDropdownChange={props.onDropdownChange}
                    value={value}
                />
            );
        case 'stateOrProvince':
            return (
                <StateField
                    classNameModifiers={classNameModifiers}
                    label={label}
                    errorMessage={errorMessage}
                    onDropdownChange={props.onDropdownChange}
                    selectedCountry={selectedCountry}
                    specifications={props.specifications}
                    value={value}
                />
            );
        default:
            return (
                <Field label={label} classNameModifiers={classNameModifiers} errorMessage={errorMessage} name={fieldName}>
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
