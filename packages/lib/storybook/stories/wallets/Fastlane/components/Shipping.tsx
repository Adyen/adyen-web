import { h } from 'preact';
import { useState } from 'preact/hooks';

interface ShippingProps {
    onCheckoutClick: (shippingAddress?: any) => void;
}

export const Shipping = ({ onCheckoutClick }: ShippingProps) => {
    const [isShippingRequired, setIsShippingRequired] = useState(true);
    const [formData, setFormData] = useState({
        givenName: '',
        familyName: '',
        addressLine1: '',
        addressLine2: '',
        addressLevel1: '',
        addressLevel2: '',
        postalCode: '',
        country: '',
        telCountryCode: '',
        telNational: ''
    });

    const handleShippingCheckboxClick = () => {
        setIsShippingRequired(!isShippingRequired);
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const fillInMockData = () => {
        setFormData({
            givenName: 'John',
            familyName: 'Doe',
            addressLine1: 'Simon Carmilgestraat 10',
            addressLine2: 'Ap 29',
            addressLevel1: 'Noord Holand',
            addressLevel2: 'Amsterdam',
            postalCode: '1028 PX',
            country: 'Netherlands',
            telCountryCode: '31',
            telNational: '611223399'
        });
    };

    const handleOnCheckoutClick = () => {
        onCheckoutClick(formData);
    };

    return (
        <div>
            <h3>Shipping Details</h3>

            <div>
                <input
                    id="shipping-required-checkbox"
                    name="shipping-required"
                    type="checkbox"
                    checked={isShippingRequired}
                    onClick={handleShippingCheckboxClick}
                />
                <label htmlFor="shipping-required-checkbox">This purchase requires shipping</label>
            </div>

            {isShippingRequired && (
                <>
                    <div>
                        <input className="email-input" name="givenName" placeholder="First name" onChange={handleChange} value={formData.givenName} />
                        <input
                            className="email-input"
                            name="familyName"
                            placeholder="Last name"
                            onChange={handleChange}
                            value={formData.familyName}
                        />
                    </div>

                    <div>
                        <input
                            className="email-input"
                            name="addressLine1"
                            placeholder="Street address"
                            onChange={handleChange}
                            value={formData.addressLine1}
                        />
                        <input
                            className="email-input"
                            name="addressLine2"
                            placeholder="Apt., ste., bldg. (optional)"
                            onChange={handleChange}
                            value={formData.addressLine2}
                        />
                    </div>

                    <div>
                        <input
                            className="email-input"
                            name="addressLevel2"
                            placeholder="City"
                            onChange={handleChange}
                            value={formData.addressLevel2}
                        />
                        <input
                            className="email-input"
                            name="addressLevel1"
                            placeholder="State"
                            onChange={handleChange}
                            value={formData.addressLevel1}
                        />
                    </div>

                    <div>
                        <input className="email-input" name="postalCode" placeholder="ZIP code" onChange={handleChange} value={formData.postalCode} />
                        <input className="email-input" name="country" placeholder="Country" onChange={handleChange} value={formData.country} />
                    </div>

                    <div>
                        <input
                            className="email-input"
                            name="telCountryCode"
                            placeholder="Country calling code"
                            onChange={handleChange}
                            value={formData.telCountryCode}
                        />
                        <input
                            className="email-input"
                            name="telNational"
                            type="tel"
                            placeholder="Phone number"
                            onChange={handleChange}
                            value={formData.telNational}
                        />
                    </div>
                </>
            )}

            <button onClick={fillInMockData}>Fill in mocked data</button>

            <button className="button">Checkout</button>
        </div>
    );
};
