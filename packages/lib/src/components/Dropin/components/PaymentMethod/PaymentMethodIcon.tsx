import { h } from 'preact';
import Img from '../../../internal/Img';
import classNames from 'classnames';
import styles from '../DropinComponent.module.scss';

interface PaymentMethodIconProps {
    /** URL to the payment method icon */
    src: string;

    /** Display name of the payment method */
    name: string;

    /** Type of the payment method*/
    type: string;

    disabled?: boolean;
}

const paymentMethodsWithoutBorder = ['googlepay', 'paywithgoogle'];

const PaymentMethodIcon = ({ src, name, type, disabled = false }: PaymentMethodIconProps) => {
    return (
        <span
            className={classNames('adyen-checkout__payment-method__image__wrapper', styles['adyen-checkout__payment-method__image__wrapper'], {
                'adyen-checkout__payment-method__image__wrapper--outline': !paymentMethodsWithoutBorder.includes(type),
                'adyen-checkout__payment-method__image__wrapper--disabled': !!disabled
            })}
            aria-hidden="true"
        >
            <Img
                className={`adyen-checkout__payment-method__image ${styles['adyen-checkout__payment-method__image']}`}
                src={src}
                alt={name}
                aria-label={name}
                focusable="false"
            />
        </span>
    );
};

export default PaymentMethodIcon;
