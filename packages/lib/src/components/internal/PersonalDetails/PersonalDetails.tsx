import { h } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import Fieldset from '../FormFields/Fieldset';
import Field from '../FormFields/Field';
import ReadOnlyPersonalDetails from './ReadOnlyPersonalDetails';
import { renderFormField } from '../FormFields';
import { personalDetailsValidationRules } from './validate';
import Validator from '../../../utils/Validator';
import useCoreContext from '../../../core/Context/useCoreContext';
import { PersonalDetailsProps, PersonalDetailsStateError, PersonalDetailsStateValid, ValidationResult } from './types';
import { checkDateInputSupport } from '../FormFields/InputDate/utils';
import { PersonalDetailsSchema } from '../../../types';

const personalDetailsSchema = ['firstName', 'lastName', 'gender', 'dateOfBirth', 'shopperEmail', 'telephoneNumber'];

export default function PersonalDetails(props: PersonalDetailsProps) {
    const { label = '', namePrefix, placeholders, requiredFields, visibility, validator } = props;
    const { i18n } = useCoreContext();
    const [data, setData] = useState<PersonalDetailsSchema>(props.data);
    const [errors, setErrors] = useState<PersonalDetailsStateError>({});
    const [valid, setValid] = useState<PersonalDetailsStateValid>({});
    const isDateInputSupported = useMemo(checkDateInputSupport, []);

    const eventHandler = (mode: string): Function => (e: Event): void => {
        const { name, value } = e.target as HTMLInputElement;
        const key = name.split(`${namePrefix}.`).pop();
        const { isValid, errorMessage }: ValidationResult = validator.validate(key, mode)(value);

        setData(prevData => ({ ...prevData, [key]: value }));
        setValid(prevValid => ({ ...prevValid, [key]: isValid }));
        setErrors(prevErrors => ({ ...prevErrors, [key]: !isValid && errorMessage }));
    };

    const generateFieldName = (name: string): string => `${namePrefix ? `${namePrefix}.` : ''}${name}`;
    const getErrorMessage = error => (typeof error === 'string' ? i18n.get(error) : error);

    useEffect(() => {
        const isValid = requiredFields.every(field => validator.validate(field, 'blur')(data[field]).isValid);
        props.onChange({ data, isValid });
    }, [data, valid, errors]);

    this.showValidation = () => {
        const errorsReducer = (acc, field) => {
            const { isValid, errorMessage }: ValidationResult = validator.validate(field, 'blur')(data[field]);
            acc[field] = !isValid && errorMessage;
            return acc;
        };

        setErrors(requiredFields.reduce(errorsReducer, {}));
    };

    if (visibility === 'hidden') return null;
    if (visibility === 'readOnly') return <ReadOnlyPersonalDetails {...props} data={data} />;

    return (
        <Fieldset classNameModifiers={[label]} label={label}>
            {requiredFields.includes('firstName') && (
                <Field label={i18n.get('firstName')} classNameModifiers={['col-50', 'firstName']} errorMessage={!!errors.firstName}>
                    {renderFormField('text', {
                        name: generateFieldName('firstName'),
                        value: data.firstName,
                        classNameModifiers: ['firstName'],
                        onInput: eventHandler('input'),
                        onChange: eventHandler('blur'),
                        placeholder: placeholders.firstName,
                        spellCheck: false
                    })}
                </Field>
            )}

            {requiredFields.includes('lastName') && (
                <Field label={i18n.get('lastName')} classNameModifiers={['col-50', 'lastName']} errorMessage={!!errors.lastName}>
                    {renderFormField('text', {
                        name: generateFieldName('lastName'),
                        value: data.lastName,
                        classNameModifiers: ['lastName'],
                        onInput: eventHandler('input'),
                        onChange: eventHandler('blur'),
                        placeholder: placeholders.lastName,
                        spellCheck: false
                    })}
                </Field>
            )}

            {requiredFields.includes('gender') && (
                <Field errorMessage={!!errors.gender} classNameModifiers={['gender']}>
                    {renderFormField('radio', {
                        i18n,
                        name: generateFieldName('gender'),
                        value: data.gender,
                        items: [
                            { id: 'MALE', name: 'male' },
                            { id: 'FEMALE', name: 'female' }
                        ],
                        classNameModifiers: ['gender'],
                        onInput: eventHandler('input'),
                        onChange: eventHandler('blur')
                    })}
                </Field>
            )}

            {requiredFields.includes('dateOfBirth') && (
                <Field
                    label={i18n.get('dateOfBirth')}
                    classNameModifiers={['col-50', 'lastName']}
                    errorMessage={getErrorMessage(errors.dateOfBirth)}
                    helper={isDateInputSupported ? null : i18n.get('dateOfBirth.format')}
                >
                    {renderFormField('date', {
                        name: generateFieldName('dateOfBirth'),
                        value: data.dateOfBirth,
                        classNameModifiers: ['dateOfBirth'],
                        onInput: eventHandler('input'),
                        onChange: eventHandler('blur'),
                        placeholder: placeholders.dateOfBirth
                    })}
                </Field>
            )}

            {requiredFields.includes('shopperEmail') && (
                <Field label={i18n.get('shopperEmail')} classNameModifiers={['shopperEmail']} errorMessage={getErrorMessage(errors.shopperEmail)}>
                    {renderFormField('emailAddress', {
                        name: generateFieldName('shopperEmail'),
                        value: data.shopperEmail,
                        classNameModifiers: ['shopperEmail'],
                        onInput: eventHandler('input'),
                        onChange: eventHandler('blur'),
                        placeholder: placeholders.shopperEmail
                    })}
                </Field>
            )}

            {requiredFields.includes('telephoneNumber') && (
                <Field
                    label={i18n.get('telephoneNumber')}
                    classNameModifiers={['telephoneNumber']}
                    errorMessage={getErrorMessage(errors.telephoneNumber)}
                >
                    {renderFormField('tel', {
                        name: generateFieldName('telephoneNumber'),
                        value: data.telephoneNumber,
                        classNameModifiers: ['telephoneNumber'],
                        onInput: eventHandler('input'),
                        onChange: eventHandler('blur'),
                        placeholder: placeholders.telephoneNumber
                    })}
                </Field>
            )}
        </Fieldset>
    );
}

PersonalDetails.defaultProps = {
    data: {},
    onChange: () => {},
    placeholders: {},
    requiredFields: personalDetailsSchema,
    validator: new Validator(personalDetailsValidationRules),
    visibility: 'editable'
};
