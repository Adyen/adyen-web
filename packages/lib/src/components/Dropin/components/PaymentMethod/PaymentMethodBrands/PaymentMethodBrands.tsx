import { h } from 'preact';
import PaymentMethodIcon from '../PaymentMethodIcon';
import { BrandConfiguration } from '../../../../Card/types';
import CompactView from './CompactView';
import { getFullBrandName } from '../../../../Card/components/CardInput/utils';
import { useCoreContext } from '../../../../../core/Context/CoreProvider';

const prepareVisibleBrands = (allowedBrands: Array<BrandConfiguration>) => {
    const visibleBrands = allowedBrands.length <= 4 ? allowedBrands : allowedBrands.slice(0, 3);
    return {
        visibleBrands,
        leftBrandsAmount: allowedBrands.length - visibleBrands.length
    };
};

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
    excludedUIBrands = [],
    isPaymentMethodSelected,
    activeBrand,
    isCompactView = true,
    keepBrandsVisible = false,
    showOtherInsteafOfNumber = false
}: PaymentMethodBrandsProps) => {
    const { i18n } = useCoreContext();

    if (isPaymentMethodSelected && !keepBrandsVisible) {
        return null;
    }

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
