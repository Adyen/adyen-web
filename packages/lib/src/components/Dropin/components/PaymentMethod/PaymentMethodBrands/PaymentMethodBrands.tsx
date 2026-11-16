import { h } from 'preact';
import { useMemo } from 'preact/hooks';

import PaymentMethodIcon from '../PaymentMethodIcon';
import { getFullBrandName } from '../../../../Card/components/CardInput/utils';
import { useCoreContext } from '../../../../../core/Context/CoreProvider';
import { BrandIcons } from '../../../../internal/BrandIcons/BrandIcons';
import { getMaxBrandsToShow } from './utils';
import type { PaymentMethodBrand } from '../../../../../types/global-types';

interface PaymentMethodBrandsProps {
    brands: Array<PaymentMethodBrand>;
    excludedUIBrands?: Array<string>;
    isPaymentMethodSelected: boolean;
    keepBrandsVisible?: boolean;
    showOtherInsteadOfNumber?: boolean;
}

const PaymentMethodBrands = ({
    brands,
    excludedUIBrands = [],
    isPaymentMethodSelected,
    keepBrandsVisible = false,
    showOtherInsteadOfNumber = false
}: Readonly<PaymentMethodBrandsProps>) => {
    const { i18n } = useCoreContext();

    if (isPaymentMethodSelected && !keepBrandsVisible) {
        return null;
    }

    const allowedBrands = useMemo(
        () => brands.filter(brand => !excludedUIBrands?.includes(brand.name)).map(brand => ({ alt: getFullBrandName(brand.name), src: brand.icon })),
        [brands, excludedUIBrands]
    );

    return (
        <BrandIcons
            brandIcons={allowedBrands}
            maxBrandsToShow={getMaxBrandsToShow(allowedBrands)}
            remainingBrandsLabel={showOtherInsteadOfNumber ? `+ ${i18n.get('paymentMethodBrand.other')}` : undefined}
            className="adyen-checkout__payment-method__brands"
            remainingBrandsLabelClassName="adyen-checkout__payment-method__brand-number"
            renderBrandIcon={brandIcon => (
                <PaymentMethodIcon key={brandIcon.alt} as="li" alt={brandIcon.alt} type={brandIcon.alt} src={brandIcon.src} />
            )}
        />
    );
};

export default PaymentMethodBrands;
