import { h } from 'preact';
import { getCardImageUrl, getFullBrandName } from '../utils';
import { BrandIconProps } from './types';
import useImage from '../../../../../core/Context/useImage';
import { useState } from 'preact/hooks';
import classNames from 'classnames';

export default function BrandIcon({ brand, brandsConfiguration = {} }: BrandIconProps) {
    const getImage = useImage();
    const imageName = brand === 'card' ? 'nocard' : brand;
    const imageUrl = brandsConfiguration[brand]?.icon ?? getCardImageUrl(imageName, getImage);

    const [hasLoaded, setHasLoaded] = useState(false);

    const handleError = () => {
        setHasLoaded(false);
    };

    const handleLoad = () => {
        setHasLoaded(true);
    };

    const fieldClassnames = classNames({
        'adyen-checkout-card-input__icon': true,
        'adyen-checkout__card__cardNumber__brandIcon': true,
        'adyen-checkout-card-input__icon--hidden': !hasLoaded
    });

    return <img className={fieldClassnames} onLoad={handleLoad} onError={handleError} alt={getFullBrandName(brand)} src={imageUrl} />;
}
