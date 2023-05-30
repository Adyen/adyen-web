import { h } from 'preact';
import styles from '../../CardInput.module.scss';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { getCardImageUrl } from '../../utils';
import { DualBrandingIconProps } from '../types';
import './DualBrandingIcon.scss';

const DualBrandingIcon = ({ brand, onClick, dataValue, notSelected, brandsConfiguration = {} }: DualBrandingIconProps) => {
    const { loadingContext } = useCoreContext();
    const imageName = brand === 'card' ? 'nocard' : brand;
    const imageUrl = brandsConfiguration[brand]?.icon ?? getCardImageUrl(imageName, loadingContext);
    const handleError = e => {
        e.target.style.cssText = 'display: none';
    };

    return (
        <img
            className={`${styles['card-input__icon']} ${
                notSelected ? 'adyen-checkout__card__cardNumber__brandIcon--not-selected' : ''
            } adyen-checkout__card__cardNumber__brandIcon`}
            onError={handleError}
            alt={brand}
            src={imageUrl}
            onClick={onClick}
            data-value={dataValue}
        />
    );
};

export default DualBrandingIcon;
