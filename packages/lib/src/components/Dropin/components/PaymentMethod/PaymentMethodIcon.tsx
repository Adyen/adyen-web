import { h } from 'preact';
import classNames from 'classnames';
import { BrandImage } from '../../../internal/BrandImage';

interface PaymentMethodIconProps {
    /** URL to the payment method icon */
    src: string;

    /** Alt description of payment method used of a11y */
    altDescription: string;

    /** Type of the payment method*/
    type: string;
}

const paymentMethodsWithoutBorder = ['googlepay', 'paywithgoogle'];

const PaymentMethodIcon = ({ src, altDescription, type }: Readonly<PaymentMethodIconProps>) => {
    const classes = paymentMethodsWithoutBorder.includes(type)
        ? 'adyen-checkout__payment-method__image__wrapper'
        : classNames('adyen-checkout__payment-method__image__wrapper', 'adyen-checkout__payment-method__image__wrapper--outline');

    return <BrandImage wrapperClassName={classes} imgClassName={'adyen-checkout__payment-method__image'} src={src} alt={altDescription} />;
};

export default PaymentMethodIcon;
