import { h } from 'preact';
import { BrandConfiguration } from '../../../../Card/types';
import PaymentMethodIcon from '../PaymentMethodIcon';
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
    excludedUIBrands?: Array<string>;
    isPaymentMethodSelected: boolean;
    keepBrandsVisible?: boolean;
    showOtherInsteafOfNumber?: boolean;
}

const PaymentMethodBrands = ({
    brands,
    excludedUIBrands = [],
    isPaymentMethodSelected,
    keepBrandsVisible = false,
    showOtherInsteafOfNumber = false
}: PaymentMethodBrandsProps) => {
    const { i18n } = useCoreContext();

    if (isPaymentMethodSelected && !keepBrandsVisible) {
        return null;
    }

    const allowedBrands = brands.filter(brand => !excludedUIBrands?.includes(brand.name));
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

export default PaymentMethodBrands;
