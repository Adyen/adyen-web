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
    keepBrandsVisible?: boolean;
    showOtherInsteafOfNumber?: boolean;
}

const PaymentMethodBrands = ({
    brands,
    excludedUIBrands,
    isPaymentMethodSelected,
    activeBrand,
    isCompactView = true,
    keepBrandsVisible = false,
    showOtherInsteafOfNumber = false
}: PaymentMethodBrandsProps) => {
    const allowedBrands = brands.filter(brand => !excludedUIBrands?.includes(brand.name));

    if (isCompactView) {
        return (
            <CompactView
                allowedBrands={allowedBrands}
                isPaymentMethodSelected={isPaymentMethodSelected}
                showOtherInsteafOfNumber={showOtherInsteafOfNumber}
                keepBrandsVisible={keepBrandsVisible}
            />
        );
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
