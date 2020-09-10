import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import Fieldset from '../FormFields/Fieldset';
import Field from '../FormFields/Field';
import ReadOnlyCompanyDetails from './ReadOnlyCompanyDetails';
import { renderFormField } from '../FormFields';
import { companyDetailsValidationRules } from './validate';
import Validator from '../../../utils/Validator';
import useCoreContext from '../../../core/Context/useCoreContext';
import { CompanyDetailsSchema, CompanyDetailsProps, CompanyDetailsStateError, CompanyDetailsStateValid } from './types';

const companyDetailsSchema = ['name', 'registrationNumber'];

export default function CompanyDetails(props: CompanyDetailsProps) {
    const { label = '', namePrefix, requiredFields, visibility, validator } = props;
    const { i18n } = useCoreContext();
    const [data, setData] = useState<CompanyDetailsSchema>(props.data);
    const [errors, setErrors] = useState<CompanyDetailsStateError>({});
    const [valid, setValid] = useState<CompanyDetailsStateValid>({});

    const eventHandler = (mode: string): Function => (e: Event): void => {
        const { name, value } = e.target as HTMLInputElement;
        const key = name.split(`${namePrefix}.`).pop();
        const { isValid, errorMessage } = validator.validate(key, mode)(value);

        setData(prevData => ({ ...prevData, [key]: value }));
        setValid(prevValid => ({ ...prevValid, [key]: isValid }));
        setErrors(prevErrors => ({ ...prevErrors, [key]: !isValid && errorMessage }));
    };

    const generateFieldName = (name: string): string => `${namePrefix ? `${namePrefix}.` : ''}${name}`;

    useEffect(() => {
        const isValid = requiredFields.every(field => validator.validate(field, 'blur')(data[field]).isValid);
        props.onChange({ data, isValid });
    }, [data, valid, errors]);

    this.showValidation = () => {
        const errorsReducer = (acc, field) => {
            const { isValid, errorMessage } = validator.validate(field, 'blur')(data[field]);
            acc[field] = !isValid && errorMessage;
            return acc;
        };

        setErrors(requiredFields.reduce(errorsReducer, {}));
    };

    if (visibility === 'hidden') return null;
    if (visibility === 'readOnly') return <ReadOnlyCompanyDetails {...props} data={data} />;

    return (
        <Fieldset classNameModifiers={[label]} label={label}>
            {requiredFields.includes('name') && (
                <Field label={i18n.get('companyDetails.name')} classNameModifiers={['name']} errorMessage={!!errors.name}>
                    {renderFormField('text', {
                        name: generateFieldName('name'),
                        value: data.name,
                        classNameModifiers: ['name'],
                        onInput: eventHandler('input'),
                        onChange: eventHandler('blur'),
                        spellCheck: false
                    })}
                </Field>
            )}

            {requiredFields.includes('registrationNumber') && (
                <Field
                    label={i18n.get('companyDetails.registrationNumber')}
                    classNameModifiers={['registrationNumber']}
                    errorMessage={!!errors.registrationNumber}
                >
                    {renderFormField('text', {
                        name: generateFieldName('registrationNumber'),
                        value: data.registrationNumber,
                        classNameModifiers: ['registrationNumber'],
                        onInput: eventHandler('input'),
                        onChange: eventHandler('blur'),
                        spellCheck: false
                    })}
                </Field>
            )}
        </Fieldset>
    );
}

CompanyDetails.defaultProps = {
    data: {},
    onChange: () => {},
    visibility: 'editable',
    requiredFields: companyDetailsSchema,
    validator: new Validator(companyDetailsValidationRules)
};
