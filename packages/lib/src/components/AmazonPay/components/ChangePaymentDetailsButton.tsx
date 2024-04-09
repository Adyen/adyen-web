import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import { ChangeActionOptions, ChangePaymentDetailsButtonProps } from '../types';

export default function ChangePaymentDetailsButton(props: ChangePaymentDetailsButtonProps) {
    const { i18n } = useCoreContext();
    const { amazonRef, amazonCheckoutSessionId } = props;

    useEffect(() => {
        const changeActionOptions: ChangeActionOptions = {
            amazonCheckoutSessionId,
            changeAction: 'changeAddress'
        };

        amazonRef.Pay.bindChangeAction('.adyen-checkout__amazonpay__button--changeAddress', changeActionOptions);
    }, []);

    return (
        <button type="button" className="adyen-checkout__button adyen-checkout__button--ghost adyen-checkout__amazonpay__button--changeAddress">
            {i18n.get('amazonpay.changePaymentDetails')}
        </button>
    );
}
