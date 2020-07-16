import { h } from 'preact';
import { getCardImageUrl } from '../utils';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { BrandIconProps } from './types';
import styles from '../CardInput.module.scss';

export default function BrandIcon({ brand }: BrandIconProps) {
    const { loadingContext } = useCoreContext();
    const imageName = brand === 'card' ? 'nocard' : brand;
    const handleError = e => {
        e.target.style.cssText = 'display: none';
    };

    return (
        <img
            className={`${styles['card-input__icon']} adyen-checkout__card__cardNumber__brandIcon`}
            onError={handleError}
            alt={brand}
            src={getCardImageUrl(imageName, loadingContext)}
        />
    );
}
