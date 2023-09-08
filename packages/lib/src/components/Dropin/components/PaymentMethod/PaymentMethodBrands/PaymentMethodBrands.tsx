import { h } from 'preact';
import PaymentMethodIcon from '../PaymentMethodIcon';
import { BrandConfiguration } from '../../../../Card/types';
import CompactView from './CompactView';
import { getFullBrandName } from '../../../../Card/components/CardInput/utils';

interface PaymentMethodBrandsProps {
    brands: Array<BrandConfiguration>;
    excludedUIBrands: Array<string>; // A list of brands that can never appear in the UI
    isPaymentMethodSelected: boolean;
    activeBrand?: string;
    isCompactView?: boolean;
}

const PaymentMethodBrands = ({ activeBrand, brands, excludedUIBrands, isPaymentMethodSelected, isCompactView = true }: PaymentMethodBrandsProps) => {
    // A set of brands filtered to exclude those that can never appear in the UI
    const allowedBrands = brands.filter(brand => !excludedUIBrands?.includes(brand.name));

    if (isCompactView) {
        return <CompactView allowedBrands={allowedBrands} isPaymentMethodSelected={isPaymentMethodSelected} />;
    }
    return (
        <span className="adyen-checkout__payment-method__brands">
            {allowedBrands.map(brand => (
                <PaymentMethodIcon
                    key={brand.name}
                    altDescription={getFullBrandName(brand.name)}
                    type={brand.name}
                    src={brand.icon}
                    disabled={activeBrand && activeBrand !== brand.name}
                />
            ))}
        </span>
    );
};

export default PaymentMethodBrands;
