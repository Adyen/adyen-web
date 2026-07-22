import { h } from 'preact';
import classNames from 'classnames';
import CVCHint from './CVCHint';
import Field from '../../../../internal/FormFields/Field';
import { useCoreContext } from '../../../../../core/Context/CoreProvider';
import { CVCProps } from './types';
import {
    CVC_POLICY_HIDDEN,
    CVC_POLICY_OPTIONAL,
    CVC_POLICY_REQUIRED,
    ENCRYPTED_SECURITY_CODE
} from '../../../../internal/SecuredFields/lib/constants';
import DataSfSpan from './DataSfSpan';
import { alternativeLabelContent } from './FieldLabelAlternative';
import './CVC.scss';

// CVC's format guidance (digit count/position) is brand-dependent, so the Amex variant of each CVC
// error message is a distinct, fully-translated key rather than something composed at runtime.
const CVC_AMEX_ERROR_KEYS = {
    'cc.cvc.920': 'cc.cvc.920.amex',
    'cc.cvc.921': 'cc.cvc.921.amex'
};

export default function CVC(props: Readonly<CVCProps>) {
    const {
        label,
        onFocusField = () => {},
        errorCode = '',
        className = '',
        classNameModifiers = [],
        focused,
        filled,
        isValid,
        frontCVC = false,
        cvcPolicy = CVC_POLICY_REQUIRED,
        showContextualElement,
        contextualText
    } = props;
    const { i18n } = useCoreContext();

    const errorMessage = errorCode ? i18n.get((frontCVC && CVC_AMEX_ERROR_KEYS[errorCode]) || errorCode) : '';

    const fieldClassnames = classNames(className, {
        'adyen-checkout__field__cvc': true,
        'adyen-checkout__card__cvc__input--hidden': cvcPolicy === CVC_POLICY_HIDDEN,
        'adyen-checkout__field__cvc--optional': cvcPolicy === CVC_POLICY_OPTIONAL
    });

    const cvcClassnames = classNames({
        'adyen-checkout__input': true,
        'adyen-checkout__input--small': true,
        'adyen-checkout__card__cvc__input': true,
        'adyen-checkout__input--error': errorMessage,
        'adyen-checkout__input--focus': focused,
        'adyen-checkout__input--valid': isValid
    });

    const fieldLabel = cvcPolicy !== CVC_POLICY_OPTIONAL ? label : i18n.get('creditCard.securityCode.label.optional');

    const handleIconClick = () => {
        onFocusField(ENCRYPTED_SECURITY_CODE);
    };

    return (
        <Field
            label={fieldLabel}
            focused={focused}
            filled={filled}
            classNameModifiers={[...classNameModifiers, 'securityCode']}
            onFocusField={() => onFocusField(ENCRYPTED_SECURITY_CODE)}
            className={fieldClassnames}
            errorMessage={errorMessage}
            isValid={isValid}
            dir={'ltr'}
            name={ENCRYPTED_SECURITY_CODE}
            i18n={i18n}
            contextVisibleToScreenReader={false}
            useLabelElement={false}
            renderAlternativeToLabel={alternativeLabelContent}
            showContextualElement={showContextualElement}
            contextualText={contextualText}
            onInputContainerClick={handleIconClick}
        >
            <DataSfSpan encryptedFieldType={ENCRYPTED_SECURITY_CODE} className={cvcClassnames} />

            <CVCHint frontCVC={frontCVC} />
        </Field>
    );
}
