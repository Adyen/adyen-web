import { h } from 'preact';
import { getCardImageUrl, getFullBrandName } from '../utils';
import { BrandIconProps } from './types';
import useImage from '../../../../../core/Context/useImage';
import Brand from '../../../../internal/Brand';

export default function BrandIcon({ brand, brandsConfiguration = {} }: BrandIconProps) {
    const getImage = useImage();
    const imageName = brand === 'card' ? 'nocard' : brand;
    const imageUrl = brandsConfiguration[brand]?.icon ?? getCardImageUrl(imageName, getImage);
    const imgClassName = `adyen-checkout-card-input__icon adyen-checkout__card__cardNumber__brandIcon`;

    return <Brand imgClassName={imgClassName} alt={getFullBrandName(brand)} url={imageUrl} />;
}
