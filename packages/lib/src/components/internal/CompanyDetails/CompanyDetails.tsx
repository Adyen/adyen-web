import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import Fieldset from '../FormFields/Fieldset';
import Field from '../FormFields/Field';
import ReadOnlyCompanyDetails from './ReadOnlyCompanyDetails';
import { renderFormField } from '../FormFields';
import { companyDetailsValidationRules } from './validate';
import useCoreContext from '../../../core/Context/useCoreContext';
import { getFormattedData } from './utils';
import { CompanyDetailsSchema, CompanyDetailsProps } from './types';
import useForm from '../../../utils/useForm';
import { ComponentMethodsRef } from '../../types';

const companyDetailsSchema = ['name', 'registrationNumber'];

export default function CompanyDetails(props: CompanyDetailsProps) {
    const { label = '', namePrefix, requiredFields, visibility } = props;
    const { i18n } = useCoreContext();
    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm<CompanyDetailsSchema>({
        schema: requiredFields,
        rules: { ...companyDetailsValidationRules, ...props.validationRules },
        defaultData: props.data
    });

    /** An object by which to expose 'public' members to the parent UIElement */
    const companyDetailsRef = useRef<ComponentMethodsRef>({});
    // Just call once
    if (!Object.keys(companyDetailsRef.current).length) {
        props.setComponentRef?.(companyDetailsRef.current);
    }

    // Expose method expected by (parent) Address.tsx
    companyDetailsRef.current.showValidation = () => {
        triggerValidation();
    };

    const generateFieldName = (name: string): string => `${namePrefix ? `${namePrefix}.` : ''}${name}`;

    const eventHandler =
        (mode: string): Function =>
        (e: Event): void => {
            const { name } = e.target as HTMLInputElement;
            const key = name.split(`${namePrefix}.`).pop();

            handleChangeFor(key, mode)(e);
        };

    useEffect(() => {
        const formattedData = getFormattedData(data);
        props.onChange({ data: formattedData, valid, errors, isValid });
    }, [data, valid, errors, isValid]);

    if (visibility === 'hidden') return null;
    if (visibility === 'readOnly') return <ReadOnlyCompanyDetails {...props} data={data} />;

    return (
        <Fieldset classNameModifiers={[label]} label={label}>
            {requiredFields.includes('name') && (
                <Field label={i18n.get('companyDetails.name')} classNameModifiers={['name']} errorMessage={!!errors.name} i18n={i18n}>
                    {renderFormField('text', {
                        name: generateFieldName('name'),
                        value: data.name,
                        classNameModifiers: ['name'],
                        onInput: eventHandler('input'),
                        onBlur: eventHandler('blur'),
                        spellCheck: false
                    })}
                </Field>
            )}

            {requiredFields.includes('registrationNumber') && (
                <Field
                    label={i18n.get('companyDetails.registrationNumber')}
                    classNameModifiers={['registrationNumber']}
                    errorMessage={!!errors.registrationNumber}
                    i18n={i18n}
                >
                    {renderFormField('text', {
                        name: generateFieldName('registrationNumber'),
                        value: data.registrationNumber,
                        classNameModifiers: ['registrationNumber'],
                        onInput: eventHandler('input'),
                        onBlur: eventHandler('blur'),
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
    validationRules: companyDetailsValidationRules
};
