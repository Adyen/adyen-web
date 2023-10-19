import { h } from 'preact';
import classNames from 'classnames';
import Img from '../../../../../internal/Img';
import './AvailableBrands.scss';
import { BrandConfiguration } from '../../../../types';
import { getFullBrandName } from '../../utils';

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
                <span key={name} className="adyen-checkout__card__brands__brand-wrapper">
                    <Img src={icon} alt={getFullBrandName(name)} />
                </span>
            ))}
        </span>
    );
};

export default AvailableBrands;
