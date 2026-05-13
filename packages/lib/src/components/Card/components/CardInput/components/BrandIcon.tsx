import { h } from 'preact';
import { getCardImageUrl, getFullBrandName } from '../utils';
import { BrandIconProps } from './types';
import useImage from '../../../../../core/Context/useImage';
import { BrandImage } from '../../../../internal/BrandImage';

export default function BrandIcon({ brand, brandsConfiguration }: Readonly<BrandIconProps>) {
    const getImage = useImage();
    const isPlaceholderIcon = brand === 'card';
    const imageName = isPlaceholderIcon ? 'nocard' : brand;
    const imageUrl = brandsConfiguration?.[brand]?.icon ?? getCardImageUrl(imageName, getImage);
    const imgClassName = `adyen-checkout-card-input__icon adyen-checkout__card__cardNumber__brandIcon`;

    return <BrandImage imgClassName={imgClassName} alt={isPlaceholderIcon ? '' : getFullBrandName(brand)} src={imageUrl} />;
}
