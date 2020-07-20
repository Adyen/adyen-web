import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import PersonalDetails from '../../../components/internal/PersonalDetails';
import Address from '../../../components/internal/Address';
import Checkbox from '../FormFields/Checkbox';
import './OpenInvoice.scss';

export default function OpenInvoice(props) {
    const { countryCode, visibility } = props;
    const showPersonalDetails = visibility.personalDetails !== 'hidden';
    const showBillingAddress = visibility.billingAddress !== 'hidden';
    const showDeliveryAddress = visibility.deliveryAddress !== 'hidden';
    const { i18n } = useCoreContext();

    const [data, setData] = useState({
        ...props.data,
        ...(props.consentCheckbox && { consentCheckbox: false })
    });
    const [errors, setErrors] = useState({});
    const [valid, setValid] = useState({});

    const personalDetailsRef = useRef(null);
    const billingAddressRef = useRef(null);
    const deliveryAddressRef = useRef(null);

    useEffect(() => {
        const personalDetailsValid = showPersonalDetails ? !!valid.personalDetails : true;
        const billingAddressValid = showBillingAddress ? !!valid.billingAddress : true;
        const deliveryAddressValid = showDeliveryAddress && !!data.separateDeliveryAddress ? !!valid.deliveryAddress : true;
        const consentCheckboxValid = props.consentCheckbox ? !!valid.consentCheckbox : true;
        const isValid = personalDetailsValid && billingAddressValid && deliveryAddressValid && consentCheckboxValid;

        props.onChange({ data, isValid });
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
            {showPersonalDetails && (
                <PersonalDetails
                    data={data.personalDetails}
                    label="personalDetails"
                    onChange={handleFieldset('personalDetails')}
                    ref={personalDetailsRef}
                    visibility={visibility.personalDetails}
                />
            )}

            {showBillingAddress && (
                <Address
                    allowedCountries={[countryCode]}
                    countryCode={countryCode}
                    data={data.billingAddress}
                    label="billingAddress"
                    onChange={handleFieldset('billingAddress')}
                    ref={billingAddressRef}
                    requiredFields={['street', 'houseNumberOrName', 'postalCode', 'city', 'country']}
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
                    allowedCountries={[countryCode]}
                    countryCode={countryCode}
                    data={data.deliveryAddress}
                    label="deliveryAddress"
                    onChange={handleFieldset('deliveryAddress')}
                    ref={deliveryAddressRef}
                    requiredFields={['street', 'houseNumberOrName', 'postalCode', 'city', 'country']}
                    visibility={visibility.deliveryAddress}
                />
            )}

            {props.consentCheckbox &&
                props.consentCheckbox({ countryCode, data, i18n, errorMessage: !!errors.consentCheckbox, onChange: handleConsentCheckbox })}

            {props.showPayButton && props.payButton({ label: i18n.get('confirmPurchase') })}
        </div>
    );
}
