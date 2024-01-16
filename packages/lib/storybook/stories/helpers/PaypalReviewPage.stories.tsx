import { Meta } from '@storybook/preact';
import { useState } from 'preact/hooks';
import { makeDetailsCall, patchPaypalOrder } from '../../helpers/checkout-api-calls';

const meta: Meta = {
    title: 'Helpers/PaypalReviewPage'
};
export default meta;

export const PaypalReviewPage = {
    render: () => {
        const data = fetchTransactionDetails();
        return <ReviewPage {...data} />;
    }
};

const DELIVERY_TYPES = {
    pickup: {
        fee: 0,
        value: 'pickup',
        label: 'Pick up'
    },
    standard: {
        fee: 500,
        value: 'standard',
        label: 'Standard'
    },
    express: {
        fee: 1500,
        value: 'express',
        label: 'Express'
    }
};

function getTotal(total: number, deliveryType: 'pickup' | 'standard' | 'express') {
    return total + DELIVERY_TYPES[deliveryType].fee;
}

function formatTotal(total: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total / 100);
}

function fetchTransactionDetails() {
    const { amountValue, paymentDetails, pspReference, shopperDetails } = JSON.parse(sessionStorage.getItem('adyen-paypal-review-page-data'));
    return { amountValue, paymentDetails, pspReference, shopperDetails };
}

const ReviewPage = ({ amountValue, paymentDetails, pspReference, shopperDetails }) => {
    const [deliveryType, setDeliveryType] = useState<'pickup' | 'standard' | 'express'>('pickup');
    const [details, setDetails] = useState(paymentDetails);
    const [isPatching, setIsPatching] = useState(false);
    const [isCompletingPayment, setIsCompletingPayment] = useState(false);

    const handleDeliveryChange = async event => {
        setIsPatching(true);

        const newTotal = amountValue + DELIVERY_TYPES[event.target.value].fee;

        const patch = {
            pspReference: pspReference,
            paymentData: details.data.paymentData,
            amount: {
                currency: 'USD',
                value: newTotal
            }
        };

        try {
            const data = await patchPaypalOrder(patch);
            const updatedDetails = { ...details, data: { ...details.data, paymentData: data.paymentData } };

            setDetails(updatedDetails);
            setDeliveryType(event.target.value);
        } catch (error) {
            alert('Error during patch');
        }
        setIsPatching(false);
    };

    const completePayment = async () => {
        setIsCompletingPayment(true);
        try {
            const result = await makeDetailsCall(details.data);
            alert(result.resultCode);
        } catch (error) {
            alert('Error when completing the payment');
        }

        setIsCompletingPayment(false);
    };

    return (
        <div>
            <h1>Review page</h1>

            {isPatching && <div> Patching order ... </div>}
            {isCompletingPayment && <div> Completing payment ... </div>}

            <div>
                <h2>Shipping to</h2>
                <div>
                    {shopperDetails.shopperName.firstName} {shopperDetails.shopperName.lastName}
                </div>
                <div>
                    {shopperDetails.shippingAddress.street}, {shopperDetails.shippingAddress.stateOrProvince}
                </div>
                <div>
                    {shopperDetails.shippingAddress.postalCode}, {shopperDetails.shippingAddress.city}
                </div>
                <div>{shopperDetails.shippingAddress.country}</div>
                <div>{shopperDetails.telephoneNumber}</div>
            </div>

            <div>
                <h2>Delivery or Pick up</h2>
                {Object.keys(DELIVERY_TYPES).map(type => (
                    <div key={type}>
                        <input
                            type="radio"
                            name="deliveryType"
                            value={DELIVERY_TYPES[type].value}
                            id={DELIVERY_TYPES[type].value}
                            checked={deliveryType === DELIVERY_TYPES[type].value}
                            disabled={isPatching}
                            onChange={handleDeliveryChange}
                        />
                        <label>
                            {DELIVERY_TYPES[type].label} {formatTotal(DELIVERY_TYPES[type].fee)}
                        </label>
                    </div>
                ))}
            </div>

            <div>
                <h2>Summary</h2>
                <div>Subtotal: {formatTotal(amountValue)}</div>
                <div>Shipping: {formatTotal(DELIVERY_TYPES[deliveryType].fee)}</div>
                <div>Total: {formatTotal(getTotal(amountValue, deliveryType))}</div>

                <button disabled={isPatching} onClick={completePayment}>
                    Complete order
                </button>
            </div>
        </div>
    );
};
