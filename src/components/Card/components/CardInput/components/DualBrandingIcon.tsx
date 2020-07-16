import { h } from 'preact';
import styles from '../CardInput.module.scss';
import { getCardImageUrl } from '../utils';
import './DualBrandingIcon.scss';

interface DualBrandingIconProps {
    brand: string;
    loadingContext: string;
    onClick?: any;
    dataValue?: string;
    notSelected?: boolean;
    onFocusField?: any;
}

const DualBrandingIcon = ({ brand, loadingContext, onClick, dataValue, notSelected }: DualBrandingIconProps) => {
    const imageName = brand === 'card' ? 'nocard' : brand;
    const onError = e => {
        e.target.style.cssText = 'display: none';
    };

    return (
        <img
            className={`${styles['card-input__icon']} ${
                notSelected ? 'adyen-checkout__card__cardNumber__brandIcon--not-selected' : ''
            } adyen-checkout__card__cardNumber__brandIcon`}
            onError={onError}
            alt={brand}
            src={getCardImageUrl(imageName, loadingContext)}
            onClick={onClick}
            data-value={dataValue}
        />
    );
};

export default DualBrandingIcon;
