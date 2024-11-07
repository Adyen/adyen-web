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

    const handleOnSubmit = e => {
        e.preventDefault();
        onCheckoutClick(formData);
    };

    return (
        <section className="shipping-section">
            <h3>Shipping Details</h3>

            <div>
                <input
                    className="shipping-checkbox"
                    id="shipping-required-checkbox"
                    name="shipping-required"
                    type="checkbox"
                    checked={isShippingRequired}
                    onClick={handleShippingCheckboxClick}
                />
                <label htmlFor="shipping-required-checkbox">This purchase requires shipping</label>
            </div>

            {isShippingRequired ? (
                <form onSubmit={handleOnSubmit}>
                    <div>
                        <input
                            className="input-field"
                            name="givenName"
                            placeholder="First name"
                            onChange={handleChange}
                            value={formData.givenName}
                            required
                        />
                        <input
                            className="input-field"
                            name="familyName"
                            placeholder="Last name"
                            onChange={handleChange}
                            value={formData.familyName}
                            required
                        />
                    </div>

                    <div>
                        <input
                            className="input-field"
                            name="addressLine1"
                            placeholder="Street address"
                            onChange={handleChange}
                            value={formData.addressLine1}
                            required
                        />
                        <input
                            className="input-field"
                            name="addressLine2"
                            placeholder="Apt., ste., bldg. (optional)"
                            onChange={handleChange}
                            value={formData.addressLine2}
                            required
                        />
                    </div>

                    <div>
                        <input
                            className="input-field"
                            name="addressLevel2"
                            placeholder="City"
                            onChange={handleChange}
                            value={formData.addressLevel2}
                            required
                        />
                        <input
                            className="input-field"
                            name="addressLevel1"
                            placeholder="State"
                            onChange={handleChange}
                            value={formData.addressLevel1}
                            required
                        />
                    </div>

                    <div>
                        <input
                            className="input-field"
                            name="postalCode"
                            placeholder="ZIP code"
                            onChange={handleChange}
                            value={formData.postalCode}
                            required
                        />
                        <input
                            className="input-field"
                            name="country"
                            placeholder="Country"
                            onChange={handleChange}
                            value={formData.country}
                            required
                        />
                    </div>

                    <div>
                        <input
                            className="input-field"
                            name="telCountryCode"
                            placeholder="Country calling code"
                            onChange={handleChange}
                            value={formData.telCountryCode}
                            required
                        />
                        <input
                            className="input-field"
                            name="telNational"
                            type="tel"
                            placeholder="Phone number"
                            onChange={handleChange}
                            value={formData.telNational}
                            required
                        />
                    </div>

                    <button type="submit" className="button">
                        Checkout
                    </button>
                    <div>
                        <button type="button" onClick={fillInMockData}>
                            Fill in mocked data
                        </button>
                    </div>
                </form>
            ) : (
                <button onClick={() => onCheckoutClick()} className="button">
                    Checkout
                </button>
            )}
        </section>
    );
};
