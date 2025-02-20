import { Fragment, h } from 'preact';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import Fieldset from '../FormFields/Fieldset';
import Field from '../FormFields/Field';
import ReadOnlyPersonalDetails from './ReadOnlyPersonalDetails';
import { personalDetailsValidationRules } from './validate';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import { PersonalDetailsProps } from './types';
import { checkDateInputSupport } from '../FormFields/InputDate/utils';
import { PersonalDetailsSchema } from '../../../types';
import { getFormattedData } from './utils';
import useForm from '../../../utils/useForm';
import './PersonalDetails.scss';
import InputText from '../FormFields/InputText';
import RadioGroup from '../FormFields/RadioGroup';
import InputDate from '../FormFields/InputDate';
import InputEmail from '../FormFields/InputEmail';
import InputTelephone from '../FormFields/InputTelephone';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import { ComponentMethodsRef } from '../UIElement/types';
import { HandleChangeForModeType } from '../../../utils/useForm/types';

export const PERSONAL_DETAILS_SCHEMA = ['firstName', 'lastName', 'gender', 'dateOfBirth', 'shopperEmail', 'telephoneNumber'];

export default function PersonalDetails(props: PersonalDetailsProps) {
    const { label = '', namePrefix, placeholders, requiredFields, visibility } = props;

    const { i18n } = useCoreContext();

    /** An object by which to expose 'public' members to the parent UIElement */
    const personalDetailsRef = useRef<ComponentMethodsRef>({});
    // Just call once
    if (!Object.keys(personalDetailsRef.current).length) {
        props.setComponentRef?.(personalDetailsRef.current);
    }

    const isDateInputSupported = useMemo(checkDateInputSupport, []);
    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm<PersonalDetailsSchema>({
        schema: requiredFields,
        // Ensure any passed validation rules are merged with the default ones
        rules: { ...personalDetailsValidationRules, ...props.validationRules },
        defaultData: props.data
    });

    // Expose method expected by (parent) PersonalDetails.tsx
    personalDetailsRef.current.showValidation = () => {
        triggerValidation();
    };

    const eventHandler =
        (mode: HandleChangeForModeType): h.JSX.GenericEventHandler<EventTarget> =>
        (e: Event): void => {
            const { name } = e.target as HTMLInputElement;
            const key = name.split(`${namePrefix}.`).pop();

            handleChangeFor(key, mode)(e);
        };

    const generateFieldName = (name: string): string => `${namePrefix ? `${namePrefix}.` : ''}${name}`;

    useEffect(() => {
        const formattedData = getFormattedData(data);
        props.onChange({ data: formattedData, valid, errors, isValid });
    }, [data, valid, errors, isValid]);

    if (visibility === 'hidden') return null;
    if (visibility === 'readOnly') return <ReadOnlyPersonalDetails {...props} data={data} />;

    return (
        <Fragment>
            <Fieldset classNameModifiers={['personalDetails']} label={label}>
                {requiredFields.includes('firstName') && (
                    <Field
                        label={i18n.get('firstName')}
                        classNameModifiers={['col-50', 'firstName']}
                        errorMessage={getErrorMessage(i18n, errors.firstName, i18n.get('firstName'))}
                        name={'firstName'}
                        i18n={i18n}
                    >
                        <InputText
                            name={generateFieldName('firstName')}
                            value={data.firstName}
                            classNameModifiers={['firstName']}
                            onInput={eventHandler('input')}
                            onBlur={eventHandler('blur')}
                            placeholder={placeholders.firstName}
                            spellCheck={false}
                            required={true}
                        />
                    </Field>
                )}

                {requiredFields.includes('lastName') && (
                    <Field
                        label={i18n.get('lastName')}
                        classNameModifiers={['col-50', 'lastName']}
                        errorMessage={getErrorMessage(i18n, errors.lastName, i18n.get('lastName'))}
                        name={'lastName'}
                        i18n={i18n}
                    >
                        <InputText
                            name={generateFieldName('lastName')}
                            value={data.lastName}
                            classNameModifiers={['lastName']}
                            onInput={eventHandler('input')}
                            onBlur={eventHandler('blur')}
                            placeholder={placeholders.lastName}
                            spellCheck={false}
                            required={true}
                        />
                    </Field>
                )}

                {requiredFields.includes('gender') && (
                    <Field
                        errorMessage={getErrorMessage(i18n, errors.gender)}
                        classNameModifiers={['gender']}
                        name={'gender'}
                        useLabelElement={false}
                    >
                        <RadioGroup
                            name={generateFieldName('gender')}
                            value={data.gender}
                            items={[
                                { id: 'MALE', name: 'male' },
                                { id: 'FEMALE', name: 'female' }
                            ]}
                            classNameModifiers={['gender']}
                            onInput={eventHandler('input')}
                            onChange={eventHandler('blur')}
                            required={true}
                        />
                    </Field>
                )}

                {requiredFields.includes('dateOfBirth') && (
                    <Field
                        label={i18n.get('dateOfBirth')}
                        classNameModifiers={['col-50', 'dateOfBirth']}
                        errorMessage={getErrorMessage(i18n, errors.dateOfBirth, i18n.get('dateOfBirth'))}
                        helper={isDateInputSupported ? null : i18n.get('dateOfBirth.format')}
                        name={'dateOfBirth'}
                        i18n={i18n}
                    >
                        <InputDate
                            name={generateFieldName('dateOfBirth')}
                            value={data.dateOfBirth}
                            classNameModifiers={['dateOfBirth']}
                            onInput={eventHandler('input')}
                            onBlur={eventHandler('blur')}
                            placeholder={placeholders.dateOfBirth}
                            required={true}
                        />
                    </Field>
                )}

                {requiredFields.includes('shopperEmail') && (
                    <Field
                        label={i18n.get('shopperEmail')}
                        classNameModifiers={['shopperEmail']}
                        errorMessage={getErrorMessage(i18n, errors.shopperEmail, i18n.get('shopperEmail'))}
                        dir={'ltr'}
                        name={'emailAddress'}
                        i18n={i18n}
                    >
                        <InputEmail
                            name={generateFieldName('shopperEmail')}
                            value={data.shopperEmail}
                            classNameModifiers={['shopperEmail']}
                            onInput={eventHandler('input')}
                            onBlur={eventHandler('blur')}
                            placeholder={placeholders.shopperEmail}
                            required={true}
                        />
                    </Field>
                )}

                {requiredFields.includes('telephoneNumber') && (
                    <Field
                        label={i18n.get('telephoneNumber')}
                        classNameModifiers={['telephoneNumber']}
                        errorMessage={getErrorMessage(i18n, errors.telephoneNumber, i18n.get('telephoneNumber'))}
                        dir={'ltr'}
                        name={'telephoneNumber'}
                        i18n={i18n}
                    >
                        <InputTelephone
                            name={generateFieldName('telephoneNumber')}
                            value={data.telephoneNumber}
                            classNameModifiers={['telephoneNumber']}
                            onInput={eventHandler('input')}
                            onBlur={eventHandler('blur')}
                            placeholder={placeholders.telephoneNumber}
                            required={true}
                        />
                    </Field>
                )}
            </Fieldset>
        </Fragment>
    );
}

PersonalDetails.defaultProps = {
    data: {},
    onChange: () => {},
    placeholders: {},
    requiredFields: PERSONAL_DETAILS_SCHEMA,
    validationRules: personalDetailsValidationRules,
    visibility: 'editable'
};
