import { h } from 'preact';
import styles from '../CardInput.module.scss';
import { getCardImageUrl } from '../utils';

interface BrandIconProps {
    brand: string;
    loadingContext: string;
}

const BrandIcon = ({ brand, loadingContext }: BrandIconProps) => {
    const imageName = brand === 'card' ? 'nocard' : brand;
    const onError = e => {
        e.target.style.cssText = 'display: none';
    };

    return (
        <img
            className={`${styles['card-input__icon']} adyen-checkout__card__cardNumber__brandIcon`}
            onError={onError}
            alt={brand}
            src={getCardImageUrl(imageName, loadingContext)}
        />
    );
};

export default BrandIcon;
