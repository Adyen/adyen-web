import { h } from 'preact';
import { getCardImageUrl, getFullBrandName } from '../utils';
import { BrandIconProps } from './types';
import useImage from '../../../../../core/Context/useImage';

export default function BrandIcon({ brand, brandsConfiguration = {} }: BrandIconProps) {
    const getImage = useImage();
    const imageName = brand === 'card' ? 'nocard' : brand;
    const imageUrl = brandsConfiguration[brand]?.icon ?? getCardImageUrl(imageName, getImage);

    const handleError = e => {
        e.target.style.cssText = 'display: none';
    };

    const handleLoad = e => {
        e.target.style.cssText = 'display: block';
    };

    return (
        <img
            className="adyen-checkout-card-input__icon adyen-checkout__card__cardNumber__brandIcon"
            onLoad={handleLoad}
            onError={handleError}
            alt={getFullBrandName(brand)}
            src={imageUrl}
        />
    );
}
