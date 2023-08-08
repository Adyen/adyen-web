import { h } from 'preact';
import PaymentMethodIcon from '../PaymentMethodIcon';
import { BrandConfiguration } from '../../../../Card/types';
import { getFullBrandName } from '../../../../Card/components/CardInput/utils';

interface CompactViewProps {
    allowedBrands: Array<BrandConfiguration>; // A set of brands filtered to exclude those that can never appear in the UI
    isPaymentMethodSelected: boolean;
}

const prepareVisibleBrands = (allowedBrands: Array<BrandConfiguration>) => {
    const visibleBrands = allowedBrands.length <= 4 ? allowedBrands : allowedBrands.slice(0, 3);
    return {
        visibleBrands,
        leftBrandsAmount: allowedBrands.length - visibleBrands.length
    };
};

const CompactView = ({ allowedBrands, isPaymentMethodSelected }: CompactViewProps) => {
    if (isPaymentMethodSelected) {
        return null;
    }

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

export default CompactView;
