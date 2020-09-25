import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import { ChangePaymentDetailsButtonProps } from '../types';

export default function ChangePaymentDetailsButton(props: ChangePaymentDetailsButtonProps) {
    const { i18n } = useCoreContext();
    const { amazonRef, amazonCheckoutSessionId } = props;

    useEffect(() => {
        amazonRef.Pay.bindChangeAction('.adyen-checkout__amazonpay__button--changeAddress', {
            amazonCheckoutSessionId,
            changeAction: 'changeAddress'
        });
    }, []);

    return (
        <button type="button" className="adyen-checkout__button adyen-checkout__button--ghost adyen-checkout__amazonpay__button--changeAddress">
            {i18n.get('amazonpay.changePaymentDetails')}
        </button>
    );
}
