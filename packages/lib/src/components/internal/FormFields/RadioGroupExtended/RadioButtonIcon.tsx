import { h } from 'preact';
import { RadioButtonIconProps } from './types';
import './RadioButtonIcon.scss';

const RadioButtonIcon = ({ onClick, dataValue, notSelected, imageURL, altName }: RadioButtonIconProps) => {
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
            alt={altName}
            src={imageURL}
            // onClick={onClick}
            data-value={dataValue}
        />
    );
};

export default RadioButtonIcon;
