import { h, Fragment } from 'preact';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import Fieldset from '../FormFields/Fieldset';
import Field from '../FormFields/Field';
import ReadOnlyPersonalDetails from './ReadOnlyPersonalDetails';
import { renderFormField } from '../FormFields';
import { personalDetailsValidationRules } from './validate';
import useCoreContext from '../../../core/Context/useCoreContext';
import { PersonalDetailsProps } from './types';
import { checkDateInputSupport } from '../FormFields/InputDate/utils';
import { PersonalDetailsSchema } from '../../../types';
import { getFormattedData, mapFieldKey } from './utils';
import useForm from '../../../utils/useForm';
import './PersonalDetails.scss';
import { setSRMessagesFromErrors } from '../../../core/Errors/utils';
import { partial } from '../SecuredFields/lib/utilities/commonUtils';
import { ComponentMethodsRef } from '../../types';

export const PERSONAL_DETAILS_SCHEMA = ['firstName', 'lastName', 'gender', 'dateOfBirth', 'shopperEmail', 'telephoneNumber'];

export default function PersonalDetails(props: PersonalDetailsProps) {
    const {
        i18n,
        commonProps: { moveFocusOnSubmitErrors }
    } = useCoreContext();

    const { label = '', namePrefix, placeholders, requiredFields, visibility } = props;

    /** SCREEN READER RELATED STUFF */
    const isValidating = useRef(false);

    /**
     * There are 2 ways a component can be instantiated.
     * Most commonly through checkout.create (which leads to a UIElement), or, it can be marked up directly e.g. from OpenInvoices, DokuInput, EcontextInput etc.
     *
     * When instantiated through checkout.create, props.modules.srPanel will have a value, which we want to use to create an SRPanelRef.
     *
     * However, when props.hasParentSRPanel is true, this means the component has either been marked up directly, or, has been instantiated in PayByLink.
     * In both cases the parent component will be responsible for handling and passing errors to the SRPanel, so we do not need a SRPanelRef or a setSRMessages function.
     */
    const { current: SRPanelRef } = useRef(!props.hasParentSRPanel ? props.modules?.srPanel : null);

    /**
     * When we have a SRPanelRef, generate a (partial) setSRMessages function, once only (since the initial set of arguments don't change).
     */
    const { current: setSRMessages } = useRef(
        SRPanelRef
            ? partial(setSRMessagesFromErrors, {
                  SRPanelRef,
                  i18n,
                  fieldTypeMappingFn: mapFieldKey,
                  isValidating,
                  moveFocusOnSubmitErrors,
                  focusSelector: '.adyen-checkout__fieldset--personalDetails'
              })
            : null
    );
    /** end SR STUFF */

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
        // set flag
        isValidating.current = true;

        triggerValidation();
    };

    const eventHandler =
        (mode: string): Function =>
        (e: Event): void => {
            const { name } = e.target as HTMLInputElement;
            const key = name.split(`${namePrefix}.`).pop();

            handleChangeFor(key, mode)(e);
        };

    const generateFieldName = (name: string): string => `${namePrefix ? `${namePrefix}.` : ''}${name}`;
    const getErrorMessage = error => (error && error.errorMessage ? i18n.get(error.errorMessage) : !!error);

    useEffect(() => {
        const formattedData = getFormattedData(data);

        setSRMessages?.(errors);

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
                        errorMessage={getErrorMessage(errors.firstName)}
                        name={'firstName'}
                        i18n={i18n}
                    >
                        {renderFormField('text', {
                            name: generateFieldName('firstName'),
                            value: data.firstName,
                            classNameModifiers: ['firstName'],
                            onInput: eventHandler('input'),
                            placeholder: placeholders.firstName,
                            spellCheck: false,
                            required: true
                        })}
                    </Field>
                )}

                {requiredFields.includes('lastName') && (
                    <Field
                        label={i18n.get('lastName')}
                        classNameModifiers={['col-50', 'lastName']}
                        errorMessage={getErrorMessage(errors.lastName)}
                        name={'lastName'}
                        i18n={i18n}
                    >
                        {renderFormField('text', {
                            name: generateFieldName('lastName'),
                            value: data.lastName,
                            classNameModifiers: ['lastName'],
                            onInput: eventHandler('input'),
                            placeholder: placeholders.lastName,
                            spellCheck: false,
                            required: true
                        })}
                    </Field>
                )}

                {requiredFields.includes('gender') && (
                    <Field errorMessage={!!errors.gender} classNameModifiers={['gender']} name={'gender'} useLabelElement={false}>
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
                            onChange: eventHandler('blur'),
                            required: true
                        })}
                    </Field>
                )}

                {requiredFields.includes('dateOfBirth') && (
                    <Field
                        label={i18n.get('dateOfBirth')}
                        classNameModifiers={['col-50', 'lastName']}
                        errorMessage={getErrorMessage(errors.dateOfBirth)}
                        helper={isDateInputSupported ? null : i18n.get('dateOfBirth.format')}
                        name={'dateOfBirth'}
                        i18n={i18n}
                    >
                        {renderFormField('date', {
                            name: generateFieldName('dateOfBirth'),
                            value: data.dateOfBirth,
                            classNameModifiers: ['dateOfBirth'],
                            onInput: eventHandler('input'),
                            placeholder: placeholders.dateOfBirth,
                            required: true
                        })}
                    </Field>
                )}

                {requiredFields.includes('shopperEmail') && (
                    <Field
                        label={i18n.get('shopperEmail')}
                        classNameModifiers={['shopperEmail']}
                        errorMessage={getErrorMessage(errors.shopperEmail)}
                        dir={'ltr'}
                        name={'emailAddress'}
                        i18n={i18n}
                    >
                        {renderFormField('emailAddress', {
                            name: generateFieldName('shopperEmail'),
                            value: data.shopperEmail,
                            classNameModifiers: ['shopperEmail'],
                            onInput: eventHandler('input'),
                            placeholder: placeholders.shopperEmail,
                            required: true
                        })}
                    </Field>
                )}

                {requiredFields.includes('telephoneNumber') && (
                    <Field
                        label={i18n.get('telephoneNumber')}
                        classNameModifiers={['telephoneNumber']}
                        errorMessage={getErrorMessage(errors.telephoneNumber)}
                        dir={'ltr'}
                        name={'telephoneNumber'}
                        i18n={i18n}
                    >
                        {renderFormField('tel', {
                            name: generateFieldName('telephoneNumber'),
                            value: data.telephoneNumber,
                            classNameModifiers: ['telephoneNumber'],
                            onInput: eventHandler('input'),
                            placeholder: placeholders.telephoneNumber,
                            required: true
                        })}
                    </Field>
                )}
            </Fieldset>
            {/* Needed to test shifting focus when showValidation is called */}
            {process.env.NODE_ENV !== 'production' && props.showPayButton && props.payButton({ label: i18n.get('continue') })}
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
