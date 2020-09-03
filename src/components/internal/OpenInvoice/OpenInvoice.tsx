import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import CompanyDetails from '../CompanyDetails';
import PersonalDetails from '../PersonalDetails';
import Address from '../Address';
import Checkbox from '../FormFields/Checkbox';
import { OpenInvoiceProps, OpenInvoiceStateData, OpenInvoiceStateError, OpenInvoiceStateValid } from './types';
import './OpenInvoice.scss';

export default function OpenInvoice(props: OpenInvoiceProps) {
    const { countryCode, visibility } = props;
    const { i18n } = useCoreContext();
    const showCompanyDetails = visibility.companyDetails !== 'hidden';
    const showPersonalDetails = visibility.personalDetails !== 'hidden';
    const showBillingAddress = visibility.billingAddress !== 'hidden';
    const showDeliveryAddress = visibility.deliveryAddress !== 'hidden';

    const [data, setData] = useState<OpenInvoiceStateData>({
        ...props.data,
        ...(props.consentCheckbox && { consentCheckbox: false })
    });
    const [errors, setErrors] = useState<OpenInvoiceStateError>({});
    const [valid, setValid] = useState<OpenInvoiceStateValid>({});
    const [status, setStatus] = useState('ready');

    this.setStatus = newStatus => {
        setStatus(newStatus);
    };

    const personalDetailsRef = useRef(null);
    const billingAddressRef = useRef(null);
    const deliveryAddressRef = useRef(null);

    useEffect(() => {
        const companyDetailsValid = showCompanyDetails ? !!valid.companyDetails : true;
        const personalDetailsValid = showPersonalDetails ? !!valid.personalDetails : true;
        const billingAddressValid = showBillingAddress ? !!valid.billingAddress : true;
        const includeDeliveryAddress = showDeliveryAddress && !!data.separateDeliveryAddress;
        const deliveryAddressValid = includeDeliveryAddress ? !!valid.deliveryAddress : true;
        const consentCheckboxValid = props.consentCheckbox ? !!valid.consentCheckbox : true;
        const isValid = companyDetailsValid && personalDetailsValid && billingAddressValid && deliveryAddressValid && consentCheckboxValid;
        const newData = {
            ...(showCompanyDetails && { companyDetails: data.companyDetails }),
            ...(showPersonalDetails && { personalDetails: data.personalDetails }),
            ...(showBillingAddress && { billingAddress: data.billingAddress }),
            ...(includeDeliveryAddress && { deliveryAddress: data.deliveryAddress })
        };

        props.onChange({ data: newData, isValid });
    }, [data, valid, errors]);

    const handleFieldset = key => state => {
        setData(prevData => ({ ...prevData, [key]: state.data }));
        setValid(prevValid => ({ ...prevValid, [key]: state.isValid }));
    };

    const handleSeparateDeliveryAddress = e => {
        setData(prevData => ({ ...prevData, separateDeliveryAddress: e.target.checked }));
    };

    const handleConsentCheckbox = e => {
        const { checked } = e.target;
        setData(prevData => ({ ...prevData, consentCheckbox: checked }));
        setValid(prevValid => ({ ...prevValid, consentCheckbox: checked }));
        setErrors(prevErrors => ({ ...prevErrors, consentCheckbox: !checked }));
    };

    this.showValidation = () => {
        if (showPersonalDetails && personalDetailsRef.current) personalDetailsRef.current.showValidation();
        if (showBillingAddress && billingAddressRef.current) billingAddressRef.current.showValidation();
        if (showDeliveryAddress && deliveryAddressRef.current) deliveryAddressRef.current.showValidation();

        setErrors({
            ...(props.consentCheckbox && { consentCheckbox: !data.consentCheckbox })
        });
    };

    return (
        <div className="adyen-checkout__open-invoice">
            {showCompanyDetails && (
                <CompanyDetails
                    data={data.companyDetails}
                    label="companyDetails"
                    onChange={handleFieldset('companyDetails')}
                    ref={personalDetailsRef}
                    visibility={visibility.companyDetails}
                />
            )}

            {showPersonalDetails && (
                <PersonalDetails
                    data={data.personalDetails}
                    requiredFields={props.personalDetailsRequiredFields}
                    label="personalDetails"
                    onChange={handleFieldset('personalDetails')}
                    ref={personalDetailsRef}
                    visibility={visibility.personalDetails}
                />
            )}

            {showBillingAddress && (
                <Address
                    allowedCountries={props.allowedCountries}
                    countryCode={countryCode}
                    data={data.billingAddress}
                    label="billingAddress"
                    onChange={handleFieldset('billingAddress')}
                    ref={billingAddressRef}
                    visibility={visibility.billingAddress}
                />
            )}

            {showDeliveryAddress && (
                <Checkbox
                    label={i18n.get('separateDeliveryAddress')}
                    classNameModifiers={['separateDeliveryAddress']}
                    name="separateDeliveryAddress"
                    onChange={handleSeparateDeliveryAddress}
                />
            )}

            {showDeliveryAddress && data.separateDeliveryAddress && (
                <Address
                    allowedCountries={props.allowedCountries}
                    countryCode={countryCode}
                    data={data.deliveryAddress}
                    label="deliveryAddress"
                    onChange={handleFieldset('deliveryAddress')}
                    ref={deliveryAddressRef}
                    visibility={visibility.deliveryAddress}
                />
            )}

            {props.consentCheckbox &&
                props.consentCheckbox({ countryCode, data, i18n, errorMessage: !!errors.consentCheckbox, onChange: handleConsentCheckbox })}

            {props.showPayButton && props.payButton({ status, label: i18n.get('confirmPurchase') })}
        </div>
    );
}
