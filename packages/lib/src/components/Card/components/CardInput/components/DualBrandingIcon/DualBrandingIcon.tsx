import { h } from 'preact';
import { getCardImageUrl, getFullBrandName } from '../../utils';
import { DualBrandingIconProps } from '../types';
import './DualBrandingIcon.scss';
import useImage from '../../../../../../core/Context/useImage';

const DualBrandingIcon = ({ brand, onClick, dataValue, brandsConfiguration = {} }: DualBrandingIconProps) => {
    const getImage = useImage();
    const imageName = brand === 'card' ? 'nocard' : brand;
    const imageUrl = brandsConfiguration[brand]?.icon ?? getCardImageUrl(imageName, getImage);
    const handleError = e => {
        e.target.style.cssText = 'display: none';
    };

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
        <img
            className={`adyen-checkout-card-input__icon adyen-checkout__card__cardNumber__brandIcon`}
            onError={handleError}
            alt={getFullBrandName(brand)}
            src={imageUrl}
            onClick={onClick}
            data-value={dataValue}
        />
    );
};

export default DualBrandingIcon;
