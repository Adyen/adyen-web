import { h } from 'preact';
import classNames from 'classnames';
import BrandIcon from './BrandIcon';
import DualBrandingIcon from './DualBrandingIcon/DualBrandingIcon';
import Field from '../../../../internal/FormFields/Field';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { CardNumberProps } from './types';
import styles from '../CardInput.module.scss';

export default function CardNumber(props: CardNumberProps) {
    const { i18n } = useCoreContext();
    const {
        error = '',
        isValid = false,
        onFocusField = () => {},
        dualBrandingElements,
        dualBrandingChangeHandler,
        dualBrandingSelected,
        dualBrandingContainsPLCC,
        numDigitsInPAN
    } = props;

    const dualBrandingIconsActive = dualBrandingContainsPLCC === true && numDigitsInPAN >= 16 ? true : isValid;

    return (
        <Field
            label={props.label}
            focused={props.focused}
            filled={props.filled}
            classNameModifiers={['cardNumber']}
            onFocusField={() => onFocusField('encryptedCardNumber')}
            errorMessage={error && i18n.get(error)}
            isValid={isValid}
            dualBrandingElements={dualBrandingElements}
        >
            <span
                data-cse="encryptedCardNumber"
                className={classNames({
                    'adyen-checkout__input': true,
                    'adyen-checkout__input--large': true,
                    'adyen-checkout__card__cardNumber__input': true,
                    [styles['adyen-checkout__input']]: true,
                    'adyen-checkout__input--error': error,
                    'adyen-checkout__input--focus': props.focused,
                    'adyen-checkout__input--valid': isValid,
                    'adyen-checkout__card__cardNumber__input--noBrand': !props.showBrandIcon
                })}
            >
                {props.showBrandIcon && !dualBrandingElements && <BrandIcon brand={props.brand} />}
            </span>

            {dualBrandingElements && !error && (
                <div
                    className={classNames([
                        'adyen-checkout__card__dual-branding__buttons',
                        { 'adyen-checkout__card__dual-branding__buttons--active': dualBrandingIconsActive } // TODO - should be isValid. This is just for testing. Remove
                    ])}
                >
                    {dualBrandingElements.map(element => (
                        <DualBrandingIcon
                            key={element.id}
                            brand={element.id === 'plcc' ? 'bcmc' : element.id} // TODO - remove ternary once plcc or Synchrony has a logo
                            onClick={dualBrandingChangeHandler}
                            dataValue={element.id}
                            notSelected={dualBrandingSelected !== '' && dualBrandingSelected !== element.id}
                        />
                    ))}
                </div>
            )}
        </Field>
    );
}
