import { h } from 'preact';
import PaymentMethodIcon from '../PaymentMethodIcon';
import { BrandConfiguration } from '../../../../Card/types';

interface CompactViewProps {
    brands: Array<BrandConfiguration>;
    excludedUIBrands: Array<string>; // A list of brands that can never appear in the UI
    isPaymentMethodSelected: boolean;
}

const prepareVisibleBrands = (brands: Array<BrandConfiguration>, excludedUIBrands: Array<string>) => {
    const allowedBrands = brands.filter(brand => !excludedUIBrands.includes(brand.name));
    const visibleBrands = allowedBrands.length <= 4 ? allowedBrands : allowedBrands.slice(0, 3);
    return {
        visibleBrands,
        leftBrandsAmount: brands.length - visibleBrands.length
    };
};

const CompactView = ({ brands, excludedUIBrands, isPaymentMethodSelected }: CompactViewProps) => {
    if (isPaymentMethodSelected) {
        return null;
    }

    const { visibleBrands, leftBrandsAmount } = prepareVisibleBrands(brands, excludedUIBrands);
    return (
        <span className="adyen-checkout__payment-method__brands">
            {visibleBrands.map(brand => (
                <PaymentMethodIcon key={brand.name} altDescription={brand.name} type={brand.name} src={brand.icon} />
            ))}
            {leftBrandsAmount !== 0 && <span className="adyen-checkout__payment-method__brand-number">+{leftBrandsAmount}</span>}
        </span>
    );
};

export default CompactView;
