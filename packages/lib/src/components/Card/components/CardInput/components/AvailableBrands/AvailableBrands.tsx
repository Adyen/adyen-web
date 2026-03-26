import { h } from 'preact';
import cn from 'classnames';

import { BrandConfiguration } from '../../../../types';
import { getFullBrandName } from '../../utils';
import { BrandIcons } from '../../../../../internal/BrandIcons/BrandIcons';
import './AvailableBrands.scss';

type AvailableBrands = Array<BrandConfiguration>;

interface PaymentMethodBrandsProps {
    brands: AvailableBrands;
    activeBrand: string;
}

const AvailableBrands = ({ brands, activeBrand }: Readonly<PaymentMethodBrandsProps>) => {
    if (!brands?.length) {
        return null;
    }

    const isValidBrand = activeBrand !== 'card';

    return (
        <BrandIcons
            className={cn('adyen-checkout__card__brands', {
                'adyen-checkout__card__brands--hidden': isValidBrand
            })}
            brandIcons={brands.map(brand => ({
                src: brand.icon,
                alt: getFullBrandName(brand.name)
            }))}
            showIconOnError
        />
    );
};

export default AvailableBrands;
