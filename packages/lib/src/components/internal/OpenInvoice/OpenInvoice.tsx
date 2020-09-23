import { h, createRef } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import CompanyDetails from '../CompanyDetails';
import PersonalDetails from '../PersonalDetails';
import Address from '../Address';
import Checkbox from '../FormFields/Checkbox';
import ConsentCheckbox from '../FormFields/ConsentCheckbox';
import { getInitialActiveFieldsets } from './utils';
import { ActiveFieldsets, FieldsetsRefs, OpenInvoiceProps, OpenInvoiceStateData, OpenInvoiceStateError, OpenInvoiceStateValid } from './types';
import './OpenInvoice.scss';

const fieldsetsSchema = ['companyDetails', 'personalDetails', 'billingAddress', 'deliveryAddress'];

export default function OpenInvoice(props: OpenInvoiceProps) {
    const { countryCode, visibility } = props;
    const { i18n } = useCoreContext();
    const initialActiveFieldsets = getInitialActiveFieldsets(fieldsetsSchema, visibility);
    const [activeFieldsets, setActiveFieldsets] = useState<ActiveFieldsets>({ ...initialActiveFieldsets, deliveryAddress: false });
    const fieldsetsRefs: FieldsetsRefs = fieldsetsSchema.reduce((acc, fieldset) => {
        acc[fieldset] = createRef();
        return acc;
    }, {});

    const checkFieldsets = () => Object.keys(activeFieldsets).every(fieldset => !activeFieldsets[fieldset] || !!valid[fieldset]);
    const hasConsentCheckbox = !!props.consentCheckboxLabel;

    const [data, setData] = useState<OpenInvoiceStateData>({
        ...props.data,
        ...(hasConsentCheckbox && { consentCheckbox: false })
    });
    const [errors, setErrors] = useState<OpenInvoiceStateError>({});
    const [valid, setValid] = useState<OpenInvoiceStateValid>({});
    const [status, setStatus] = useState('ready');

    this.setStatus = newStatus => {
        setStatus(newStatus);
    };

    useEffect(() => {
        const fieldsetsAreValid = checkFieldsets();
        const consentCheckboxValid = !hasConsentCheckbox || !!valid.consentCheckbox;
        const isValid = fieldsetsAreValid && consentCheckboxValid;

        props.onChange({ data, isValid });
    }, [data, valid, errors]);

    const handleFieldset = key => state => {
        setData(prevData => ({ ...prevData, [key]: state.data }));
        setValid(prevValid => ({ ...prevValid, [key]: state.isValid }));
    };

    const handleSeparateDeliveryAddress = e => {
        setActiveFieldsets(prevActiveFields => ({ ...prevActiveFields, deliveryAddress: e.target.checked }));
    };

    const handleConsentCheckbox = e => {
        const { checked } = e.target;
        setData(prevData => ({ ...prevData, consentCheckbox: checked }));
        setValid(prevValid => ({ ...prevValid, consentCheckbox: checked }));
        setErrors(prevErrors => ({ ...prevErrors, consentCheckbox: !checked }));
    };

    this.showValidation = () => {
        fieldsetsSchema.forEach(fieldset => {
            if (fieldsetsRefs[fieldset].current) fieldsetsRefs[fieldset].current.showValidation();
        });

        setErrors({
            ...(hasConsentCheckbox && { consentCheckbox: !data.consentCheckbox })
        });
    };

    return (
        <div className="adyen-checkout__open-invoice">
            {activeFieldsets.companyDetails && (
                <CompanyDetails
                    data={data.companyDetails}
                    label="companyDetails"
                    onChange={handleFieldset('companyDetails')}
                    ref={fieldsetsRefs.companyDetails}
                    visibility={visibility.companyDetails}
                />
            )}

            {activeFieldsets.personalDetails && (
                <PersonalDetails
                    data={data.personalDetails}
                    requiredFields={props.personalDetailsRequiredFields}
                    label="personalDetails"
                    onChange={handleFieldset('personalDetails')}
                    ref={fieldsetsRefs.personalDetails}
                    visibility={visibility.personalDetails}
                />
            )}

            {activeFieldsets.billingAddress && (
                <Address
                    allowedCountries={props.allowedCountries}
                    countryCode={countryCode}
                    data={data.billingAddress}
                    label="billingAddress"
                    onChange={handleFieldset('billingAddress')}
                    ref={fieldsetsRefs.billingAddress}
                    visibility={visibility.billingAddress}
                />
            )}

            {initialActiveFieldsets.deliveryAddress && (
                <Checkbox
                    label={i18n.get('separateDeliveryAddress')}
                    classNameModifiers={['separateDeliveryAddress']}
                    name="separateDeliveryAddress"
                    onChange={handleSeparateDeliveryAddress}
                />
            )}

            {activeFieldsets.deliveryAddress && (
                <Address
                    allowedCountries={props.allowedCountries}
                    countryCode={countryCode}
                    data={data.deliveryAddress}
                    label="deliveryAddress"
                    onChange={handleFieldset('deliveryAddress')}
                    ref={fieldsetsRefs.deliveryAddress}
                    visibility={visibility.deliveryAddress}
                />
            )}

            {hasConsentCheckbox && (
                <ConsentCheckbox
                    data={data}
                    errorMessage={!!errors.consentCheckbox}
                    label={props.consentCheckboxLabel}
                    onChange={handleConsentCheckbox}
                />
            )}

            {props.showPayButton && props.payButton({ status, label: i18n.get('confirmPurchase') })}
        </div>
    );
}
