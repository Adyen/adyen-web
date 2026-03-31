import { h } from 'preact';
import classNames from 'classnames';
import BrandIcon from './BrandIcon';
import Field from '../../../../internal/FormFields/Field';
import { useCoreContext } from '../../../../../core/Context/CoreProvider';
import { CardNumberProps } from './types';
import DataSfSpan from './DataSfSpan';
import { ENCRYPTED_CARD_NUMBER } from '../../../../internal/SecuredFields/lib/constants';
import { alternativeLabelContent } from './FieldLabelAlternative';
import './CardNumber.scss';
import { mustHandleDualBrandingAccordingToEURegulations } from '../utils';
import { DUAL_BRANDS_THAT_NEED_SELECTION_MECHANISM } from '../../../constants';

export default function CardNumber(props: Readonly<CardNumberProps>) {
    const { i18n } = useCoreContext();
    const { error = '', isValid = false, onFocusField = () => {}, dualBrandingElements } = props;

    const handleIconClick = () => {
        onFocusField(ENCRYPTED_CARD_NUMBER);
    };

    const showDualBrandSelectElementsForEU = dualBrandingElements
        ? mustHandleDualBrandingAccordingToEURegulations(DUAL_BRANDS_THAT_NEED_SELECTION_MECHANISM, dualBrandingElements, 'id')
        : false;

    // Unlike other fields we don't respect the 'showContextualElement' config prop (that the merchant can set to false)
    // We always show the contextual text for EU dual branding
    const contextualText = showDualBrandSelectElementsForEU ? i18n.get('creditCard.dualBrand.description') : null;

    return (
        <Field
            label={props.label}
            focused={props.focused}
            filled={props.filled}
            classNameModifiers={['cardNumber']}
            onFocusField={() => onFocusField(ENCRYPTED_CARD_NUMBER)}
            errorMessage={error}
            isValid={isValid}
            dir={'ltr'}
            name={ENCRYPTED_CARD_NUMBER}
            showValidIcon={false}
            i18n={i18n}
            contextVisibleToScreenReader={false} // securedFields have their own, internal, aria-describedby element
            useLabelElement={false}
            renderAlternativeToLabel={alternativeLabelContent}
            onInputContainerClick={handleIconClick}
            contextualText={contextualText}
        >
            <DataSfSpan
                encryptedFieldType={ENCRYPTED_CARD_NUMBER}
                className={classNames({
                    'adyen-checkout__input': true,
                    'adyen-checkout__input--large': true,
                    'adyen-checkout__card__cardNumber__input': true,
                    'adyen-checkout__input--error': error,
                    'adyen-checkout__input--focus': props.focused,
                    'adyen-checkout__input--valid': isValid,
                    'adyen-checkout__card__cardNumber__input--noBrand': !props.showBrandIcon
                })}
            ></DataSfSpan>

            {props.showBrandIcon && !dualBrandingElements && <BrandIcon brandsConfiguration={props.brandsConfiguration} brand={props.brand} />}

            {dualBrandingElements && !error && (
                <div className={classNames(['adyen-checkout__card__dual-branding__icons'])}>
                    {dualBrandingElements.map(element => {
                        if (showDualBrandSelectElementsForEU) {
                            console.log('### CardNumber:::: ADD new dual branding component!!');
                            return null;
                        } else {
                            return <BrandIcon key={element.id} brand={element.id} brandsConfiguration={props.brandsConfiguration} />;
                        }
                    })}
                </div>
            )}
        </Field>
    );
}
