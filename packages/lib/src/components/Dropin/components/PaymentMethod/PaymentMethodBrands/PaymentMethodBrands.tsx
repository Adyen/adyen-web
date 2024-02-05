import { h } from 'preact';
import { BrandConfiguration } from '../../../../Card/types';
import PaymentMethodIcon from '../PaymentMethodIcon';
import { getFullBrandName } from '../../../../Card/components/CardInput/utils';

const prepareVisibleBrands = (allowedBrands: Array<BrandConfiguration>) => {
    const visibleBrands = allowedBrands.length <= 4 ? allowedBrands : allowedBrands.slice(0, 3);
    return {
        visibleBrands,
        leftBrandsAmount: allowedBrands.length - visibleBrands.length
    };
};

interface PaymentMethodBrandsProps {
    brands: Array<BrandConfiguration>;
    excludedUIBrands?: Array<string>;
    isPaymentMethodSelected: boolean;
}

const PaymentMethodBrands = ({ brands, excludedUIBrands = [], isPaymentMethodSelected }: PaymentMethodBrandsProps) => {
    if (isPaymentMethodSelected) {
        return null;
    }

    const allowedBrands = brands.filter(brand => !excludedUIBrands?.includes(brand.name));
    const { visibleBrands, leftBrandsAmount } = prepareVisibleBrands(allowedBrands);

    return (
        <span className="adyen-checkout__payment-method__brands">
            {visibleBrands.map(brand => (
                <PaymentMethodIcon key={brand.name} altDescription={getFullBrandName(brand.name)} type={brand.name} src={brand.icon} />
            ))}
            {leftBrandsAmount !== 0 && <span className="adyen-checkout__payment-method__brand-number">+{leftBrandsAmount}</span>}
        </span>
    );
};

export default PaymentMethodBrands;
