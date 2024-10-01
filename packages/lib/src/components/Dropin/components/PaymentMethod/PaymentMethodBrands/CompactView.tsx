import { h } from 'preact';
import PaymentMethodIcon from '../PaymentMethodIcon';
import { BrandConfiguration } from '../../../../Card/types';
import { getFullBrandName } from '../../../../Card/components/CardInput/utils';
import useCoreContext from '../../../../../core/Context/useCoreContext';

interface CompactViewProps {
    allowedBrands: Array<BrandConfiguration>; // A set of brands filtered to exclude those that can never appear in the UI
    isPaymentMethodSelected: boolean;
    keepBrandsVisible?: boolean;
    showOtherInsteafOfNumber?: boolean;
}

const prepareVisibleBrands = (allowedBrands: Array<BrandConfiguration>) => {
    const visibleBrands = allowedBrands.length <= 4 ? allowedBrands : allowedBrands.slice(0, 3);
    return {
        visibleBrands,
        leftBrandsAmount: allowedBrands.length - visibleBrands.length
    };
};

const CompactView = ({ allowedBrands, isPaymentMethodSelected, showOtherInsteafOfNumber = false, keepBrandsVisible = false }: CompactViewProps) => {
    const { i18n } = useCoreContext();

    if (isPaymentMethodSelected && !keepBrandsVisible) {
        return null;
    }

    const { visibleBrands, leftBrandsAmount } = prepareVisibleBrands(allowedBrands);
    return (
        <span className="adyen-checkout__payment-method__brands">
            {visibleBrands.map(brand => (
                <PaymentMethodIcon key={brand.name} altDescription={getFullBrandName(brand.name)} type={brand.name} src={brand.icon} />
            ))}
            {showOtherInsteafOfNumber ? (
                <span className="adyen-checkout__payment-method__brand-number">+ {i18n.get('paymentMethodBrand.other')}</span>
            ) : (
                leftBrandsAmount !== 0 && <span className="adyen-checkout__payment-method__brand-number">+{leftBrandsAmount}</span>
            )}
        </span>
    );
};

export default CompactView;
