import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import CompanyDetails from '../CompanyDetails';
import PersonalDetails from '../PersonalDetails';
import Address from '../Address';
import Checkbox from '../FormFields/Checkbox';
import ConsentCheckbox from '../FormFields/ConsentCheckbox';
import { getActiveFieldsData, getInitialActiveFieldsets, fieldsetsSchema } from './utils';
import {
    OpenInvoiceActiveFieldsets,
    OpenInvoiceFieldsetsRefs,
    OpenInvoiceProps,
    OpenInvoiceStateData,
    OpenInvoiceStateError,
    OpenInvoiceStateValid
} from './types';
import './OpenInvoice.scss';
import IbanInput from '../IbanInput';
import { GenericError } from '../../../core/Errors/types';
import Field from '../FormFields/Field';
import FormInstruction from '../FormInstruction';
import { ComponentMethodsRef } from '../UIElement/types';
import useSRPanelForOpenInvoiceErrors from './useSRPanelForOpenInvoiceErrors';

const consentCBErrorObj: GenericError = {
    isValid: false,
    errorMessage: 'consent.checkbox.invalid',
    error: 'consent.checkbox.invalid'
};

export default function OpenInvoice(props: OpenInvoiceProps) {
    const { countryCode, visibility } = props;
    const { i18n } = useCoreContext();

    /** An object by which to expose 'public' members to the parent UIElement */
    const openInvoiceRef = useRef<ComponentMethodsRef>({});
    // Just call once
    if (!Object.keys(openInvoiceRef.current).length) {
        props.setComponentRef?.(openInvoiceRef.current);
    }

    const isValidating = useRef(false);

    const initialActiveFieldsets: OpenInvoiceActiveFieldsets = getInitialActiveFieldsets(visibility, props.data);
    const [activeFieldsets, setActiveFieldsets] = useState<OpenInvoiceActiveFieldsets>(initialActiveFieldsets);

    const { current: fieldsetsRefs } = useRef<OpenInvoiceFieldsetsRefs>(
        fieldsetsSchema.reduce((acc, fieldset) => {
            acc[fieldset] = ref => {
                fieldsetsRefs[fieldset].current = ref;
            };
            return acc;
        }, {})
    );

    const checkFieldsets = () => Object.keys(activeFieldsets).every(fieldset => !activeFieldsets[fieldset] || !!valid[fieldset]);
    const hasConsentCheckbox = !!props.consentCheckboxLabel;
    const isStandAloneButton = !hasConsentCheckbox && Object.keys(activeFieldsets).every(key => !activeFieldsets[key]);
    const showSeparateDeliveryAddressCheckbox = visibility.deliveryAddress === 'editable' && visibility.billingAddress !== 'hidden';

    const [data, setData] = useState<OpenInvoiceStateData>({
        ...props.data,
        ...(hasConsentCheckbox && { consentCheckbox: false })
    });
    const [errors, setErrors] = useState<OpenInvoiceStateError>({});
    const [valid, setValid] = useState<OpenInvoiceStateValid>({});
    const [status, setStatus] = useState('ready');

    // Expose methods expected by parent
    openInvoiceRef.current.showValidation = () => {
        isValidating.current = true;
        fieldsetsSchema.forEach(fieldset => {
            if (fieldsetsRefs[fieldset].current) fieldsetsRefs[fieldset].current.showValidation();
        });

        setErrors({
            ...(hasConsentCheckbox && { consentCheckbox: data.consentCheckbox ? null : consentCBErrorObj })
        });
    };

    openInvoiceRef.current.setStatus = setStatus;

    useSRPanelForOpenInvoiceErrors({ errors, data, props, isValidating });

    useEffect(() => {
        const fieldsetsAreValid: boolean = checkFieldsets();
        const consentCheckboxValid: boolean = !hasConsentCheckbox || !!valid.consentCheckbox;
        const isValid: boolean = fieldsetsAreValid && consentCheckboxValid;
        const newData: OpenInvoiceStateData = getActiveFieldsData(activeFieldsets, data);
        props.onChange({ data: newData, errors, valid, isValid });
    }, [data, activeFieldsets]);

    const handleFieldset = key => state => {
        setData(prevData => ({ ...prevData, [key]: state.data }));
        setValid(prevValid => ({ ...prevValid, [key]: state.isValid }));
        setErrors(prevErrors => ({ ...prevErrors, [key]: state.errors }));
    };

    const handleSeparateDeliveryAddress = () => {
        setActiveFieldsets(prevActiveFields => ({
            ...prevActiveFields,
            deliveryAddress: !activeFieldsets.deliveryAddress
        }));
    };

    const handleConsentCheckbox = e => {
        const { checked } = e.target;
        setData(prevData => ({ ...prevData, consentCheckbox: checked }));
        setValid(prevValid => ({ ...prevValid, consentCheckbox: checked }));
        setErrors(prevErrors => ({ ...prevErrors, ...{ consentCheckbox: !checked ? consentCBErrorObj : null } }));
    };
    return (
        <div className="adyen-checkout__open-invoice">
            <FormInstruction />

            {activeFieldsets.companyDetails && (
                <CompanyDetails
                    data={props.data.companyDetails}
                    label="companyDetails"
                    onChange={handleFieldset('companyDetails')}
                    setComponentRef={fieldsetsRefs.companyDetails}
                    visibility={visibility.companyDetails}
                />
            )}

            {activeFieldsets.personalDetails && (
                <PersonalDetails
                    data={props.data.personalDetails}
                    requiredFields={props.personalDetailsRequiredFields}
                    label="personalDetails"
                    onChange={handleFieldset('personalDetails')}
                    setComponentRef={fieldsetsRefs.personalDetails}
                    visibility={visibility.personalDetails}
                />
            )}

            {activeFieldsets.bankAccount && (
                <IbanInput
                    holderName={true}
                    label="ach.bankAccount"
                    data={data.bankAccount}
                    onChange={handleFieldset('bankAccount')}
                    ref={fieldsetsRefs.bankAccount}
                />
            )}

            {activeFieldsets.billingAddress && (
                <Address
                    allowedCountries={props?.billingAddressSpecification?.allowedCountries ?? props.allowedCountries}
                    countryCode={countryCode}
                    requiredFields={props.billingAddressRequiredFields}
                    specifications={props.billingAddressSpecification}
                    data={data.billingAddress}
                    label="billingAddress"
                    onChange={handleFieldset('billingAddress')}
                    setComponentRef={fieldsetsRefs.billingAddress}
                    visibility={visibility.billingAddress}
                />
            )}

            {showSeparateDeliveryAddressCheckbox && (
                <Field
                    classNameModifiers={['separateDeliveryAddress', 'consentCheckbox']}
                    name={'separateDeliveryAddress'}
                    useLabelElement={false}
                    showErrorElement={false}
                >
                    <Checkbox
                        label={i18n.get('separateDeliveryAddress')}
                        checked={activeFieldsets.deliveryAddress}
                        classNameModifiers={['separateDeliveryAddress']}
                        name={'separateDeliveryAddress'}
                        onChange={handleSeparateDeliveryAddress}
                    />
                </Field>
            )}

            {activeFieldsets.deliveryAddress && (
                <Address
                    allowedCountries={props?.deliveryAddressSpecification?.allowedCountries ?? props.allowedCountries}
                    countryCode={countryCode}
                    requiredFields={props.deliveryAddressRequiredFields}
                    specifications={props.deliveryAddressSpecification}
                    data={data.deliveryAddress}
                    label="deliveryAddress"
                    onChange={handleFieldset('deliveryAddress')}
                    setComponentRef={fieldsetsRefs.deliveryAddress}
                    visibility={visibility.deliveryAddress}
                />
            )}

            {hasConsentCheckbox && (
                <ConsentCheckbox
                    data={data}
                    errorMessage={!!errors.consentCheckbox}
                    label={props.consentCheckboxLabel}
                    onChange={handleConsentCheckbox}
                    i18n={i18n}
                />
            )}

            {props.showPayButton &&
                props.payButton({
                    status,
                    classNameModifiers: [...(isStandAloneButton ? ['standalone'] : [])],
                    label: i18n.get('confirmPurchase')
                })}
        </div>
    );
}
