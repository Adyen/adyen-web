import { Meta } from '@storybook/preact';
import { useState } from 'preact/hooks';
import { makeDetailsCall } from '../../helpers/checkout-api-calls';

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

function formatTotal(total: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total);
}

function fetchTransactionDetails() {
    const { amountValue, paymentDetails, pspReference, shopperDetails, paypalOrder } = JSON.parse(
        sessionStorage.getItem('adyen-paypal-review-page-data')
    );
    return { amountValue, paymentDetails, pspReference, shopperDetails, paypalOrder };
}

const ReviewPage = ({ paymentDetails, shopperDetails, paypalOrder }) => {
    const [isCompletingPayment, setIsCompletingPayment] = useState(false);

    const completePayment = async () => {
        setIsCompletingPayment(true);
        try {
            const result = await makeDetailsCall(paymentDetails.data);
            alert(result.resultCode);
        } catch (error) {
            alert('Error when completing the payment');
        }

        setIsCompletingPayment(false);
    };

    return (
        <div>
            <h1>Review page</h1>

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
                <h2>Delivery type</h2>
                <div>
                    {paypalOrder.purchase_units[0].shipping.options[0].label}: ${paypalOrder.purchase_units[0].shipping.options[0].amount.value}
                </div>
            </div>

            <div>
                <h2>Summary</h2>
                <div>Subtotal: {formatTotal(paypalOrder.purchase_units[0].amount.breakdown.item_total.value)}</div>
                <div>Shipping: {formatTotal(paypalOrder.purchase_units[0].amount.breakdown.shipping.value)}</div>
                <div>Total: {formatTotal(paypalOrder.purchase_units[0].amount.value)}</div>

                <button disabled={isCompletingPayment} onClick={completePayment}>
                    Complete Payment
                </button>
            </div>
        </div>
    );
};
