import { h } from 'preact';
import styles from '../CardInput.module.scss';
import { getCardImageUrl } from '../utils';

interface DualBrandingIconProps {
    brand: string;
    loadingContext: string;
    onClick?: any;
    dataValue?: string;
    selected?: boolean;
    onFocusField?: any;
}

const DualBrandingIcon = ({ brand, loadingContext, onClick, dataValue, selected }: DualBrandingIconProps) => {
    const imageName = brand === 'card' ? 'nocard' : brand;
    const onError = e => {
        e.target.style.cssText = 'display: none';
    };

    const onClickHandler = e => {
        console.log('### DualBrandingIcon::onClick:: image click');
        onClick(e);
    };

    return (
        <img
            className={`${styles['card-input__icon']} ${
                selected ? 'adyen-checkout__card__cardNumber__brandIcon--selected' : ''
            } adyen-checkout__card__cardNumber__brandIcon`}
            onError={onError}
            alt={brand}
            src={getCardImageUrl(imageName, loadingContext)}
            onClick={onClickHandler}
            data-value={dataValue}
        />
    );
};

export default DualBrandingIcon;
