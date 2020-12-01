import { h } from 'preact';
import useCoreContext from '../../../core/Context/useCoreContext';
import Button from '../../internal/Button';
import { updateAmazonCheckoutSession } from '../services';
import { OrderButtonProps } from '../types';

export default function OrderButton(props: OrderButtonProps) {
    const { i18n, loadingContext } = useCoreContext();

    const createOrder = () => {
        const { amazonCheckoutSessionId: checkoutSessionId, amount, clientKey, returnUrl: checkoutResultReturnUrl } = props;

        const data = {
            amount,
            checkoutSessionId,
            checkoutResultReturnUrl
        };

        updateAmazonCheckoutSession(loadingContext, clientKey, data)
            .then(response => {
                if (!response?.action?.type) return console.error(response.errorMessage || 'Could not get the AmazonPay URL');
                if (response.action.type === 'redirect') window.location.assign(response.action.url);
            })
            .catch(error => {
                console.error(error);
                if (props.onError) props.onError(error);
            });
    };

    return <Button classNameModifiers={['standalone', 'pay']} label={i18n.get('confirmPurchase')} onClick={createOrder} />;
}
