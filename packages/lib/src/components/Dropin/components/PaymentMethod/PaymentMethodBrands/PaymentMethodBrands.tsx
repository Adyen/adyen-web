import { h } from 'preact';
import PaymentMethodIcon from '../PaymentMethodIcon';
import { BrandConfiguration } from '../../../../Card/types';
import CompactView from './CompactView';

interface PaymentMethodBrandsProps {
    brands: Array<BrandConfiguration>;
    excludedUIBrands: Array<string>; // A list of brands that can never appear in the UI
    isPaymentMethodSelected: boolean;
    activeBrand?: string;
    isCompactView?: boolean;
}

const PaymentMethodBrands = ({ activeBrand, brands, excludedUIBrands, isPaymentMethodSelected, isCompactView = true }: PaymentMethodBrandsProps) => {
    if (isCompactView) {
        return <CompactView brands={brands} excludedUIBrands={excludedUIBrands} isPaymentMethodSelected={isPaymentMethodSelected} />;
    }

    return (
        <span className="adyen-checkout__payment-method__brands">
            {brands.map(
                brand =>
                    !excludedUIBrands?.includes(brand.name) && (
                        <PaymentMethodIcon
                            key={brand.name}
                            altDescription={brand.name}
                            type={brand.name}
                            src={brand.icon}
                            disabled={activeBrand && activeBrand !== brand.name}
                        />
                    )
            )}
        </span>
    );
};

export default PaymentMethodBrands;
