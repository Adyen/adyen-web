import { h } from 'preact';
// import { getFullBrandName } from '../../utils';
import { RadioButtonIconProps } from './types';
import './RadioButtonIcon.scss';
import useImage from '../../../../core/Context/useImage';

const RadioButtonIcon = ({
    brand,
    onClick,
    dataValue,
    notSelected,
    getImageURL,
    getFullBrandName,
    brandsConfiguration = {}
}: RadioButtonIconProps) => {
    const getImage = useImage();
    const imageName = brand === 'card' ? 'nocard' : brand;
    const imageUrl = brandsConfiguration[brand]?.icon ?? getImageURL(imageName, getImage);
    // TODO needs replaced with the mechanism for the card regular icon
    const handleError = e => {
        e.target.style.cssText = 'display: none';
    };

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
        <img
            className={`adyen-checkout-card-input__icon ${
                notSelected ? 'adyen-checkout__card__cardNumber__brandIcon--not-selected' : ''
            } adyen-checkout__card__cardNumber__brandIcon`}
            onError={handleError}
            alt={getFullBrandName(brand)}
            src={imageUrl}
            onClick={onClick}
            data-value={dataValue}
        />
    );
};

export default RadioButtonIcon;
