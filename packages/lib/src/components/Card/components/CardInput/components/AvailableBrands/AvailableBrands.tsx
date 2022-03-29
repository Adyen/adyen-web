import { h } from 'preact';
import classNames from 'classnames';
import Img from '../../../../../internal/Img';
import './AvailableBrands.scss';
import { BrandConfiguration } from '../../../../types';

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
        <span className="adyen-checkout__card__brands">
            {brands.map(({ name, icon }) => (
                <span
                    key={name}
                    className={classNames('adyen-checkout__card__brands__brand-wrapper', {
                        'adyen-checkout__card__brands__brand-wrapper--disabled': isValidBrand && activeBrand !== name
                    })}
                >
                    <Img src={icon} alt={name} />
                </span>
            ))}
        </span>
    );
};

export default AvailableBrands;
