import { h } from 'preact';
import classNames from 'classnames';
import './AvailableBrands.scss';
import { BrandConfiguration } from '../../../../types';
import { getFullBrandName } from '../../utils';
import Brand from '../../../../../internal/Brand';

type AvailableBrands = Array<BrandConfiguration>;

interface PaymentMethodBrandsProps {
    brands: AvailableBrands;
    activeBrand: string;
}

const AvailableBrands = ({ brands, activeBrand }: PaymentMethodBrandsProps) => {
    if (!brands?.length) {
        return null;
    }

    const isValidBrand = activeBrand !== 'card';
    return (
        <span
            className={classNames('adyen-checkout__card__brands', {
                'adyen-checkout__card__brands--hidden': isValidBrand
            })}
        >
            {brands.map(({ name, icon }) => (
                <Brand wrapperClassName={'adyen-checkout__card__brands__brand-wrapper'} key={name} url={icon} alt={getFullBrandName(name)}></Brand>
            ))}
        </span>
    );
};

export default AvailableBrands;
