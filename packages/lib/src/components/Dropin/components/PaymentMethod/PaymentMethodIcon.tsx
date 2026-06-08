import { h } from 'preact';
import classNames from 'classnames';
import { BrandImage } from '../../../internal/BrandImage';
import { ElementType } from 'preact/compat';

interface PaymentMethodIconProps {
    src: string;
    alt: string;
    type: string;
    as?: ElementType;
}

const paymentMethodsWithoutBorder = new Set(['googlepay', 'paywithgoogle']);

const PaymentMethodIcon = ({ src, alt, type, as }: Readonly<PaymentMethodIconProps>) => {
    const classes = paymentMethodsWithoutBorder.has(type)
        ? 'adyen-checkout__payment-method__image__wrapper'
        : classNames('adyen-checkout__payment-method__image__wrapper', 'adyen-checkout__payment-method__image__wrapper--outline');

    return <BrandImage as={as} wrapperClassName={classes} imgClassName={'adyen-checkout__payment-method__image'} src={src} alt={alt} />;
};

export default PaymentMethodIcon;
