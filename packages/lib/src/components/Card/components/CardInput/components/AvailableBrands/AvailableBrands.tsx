import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import cn from 'classnames';

import type { PaymentMethodBrand } from '../../../../../../types/global-types';
import { getFullBrandName } from '../../utils';
import { BrandIcons } from '../../../../../internal/BrandIcons/BrandIcons';
import './AvailableBrands.scss';

type AvailableBrands = Array<PaymentMethodBrand>;

interface PaymentMethodBrandsProps {
    brands?: AvailableBrands;
    activeBrand: string;
}

const AvailableBrands = ({ brands, activeBrand }: Readonly<PaymentMethodBrandsProps>) => {
    if (!brands?.length) {
        return null;
    }

    const isValidBrand = activeBrand !== 'card';

    const brandIcons = useMemo(
        () =>
            brands.map(brand => ({
                src: brand.icon,
                alt: getFullBrandName(brand.name)
            })),
        [brands]
    );

    return (
        <BrandIcons
            className={cn('adyen-checkout__card__brands', {
                'adyen-checkout__card__brands--hidden': isValidBrand
            })}
            brandIcons={brandIcons}
            smallIcons
            showIconOnError
            containerType="grid"
            ariaHidden={isValidBrand || undefined}
        />
    );
};

export default AvailableBrands;
