import { h } from 'preact';
import Img from '~/components/internal/Img';
import classNames from 'classnames';
import styles from '../DropinComponent.module.scss';

const PaymentMethodIcon = ({ src, name, disabled = false }) => {
    return (
        <span
            className={classNames('adyen-checkout__payment-method__image__wrapper', styles['adyen-checkout__payment-method__image__wrapper'], {
                'adyen-checkout__payment-method__image__wrapper--disabled': !!disabled
            })}
        >
            <Img
                className={`adyen-checkout__payment-method__image ${styles['adyen-checkout__payment-method__image']}`}
                src={src}
                alt={name}
                aria-label={name}
            />
        </span>
    );
};

export default PaymentMethodIcon;
