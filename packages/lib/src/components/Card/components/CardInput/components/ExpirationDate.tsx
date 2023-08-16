import { h } from 'preact';
import classNames from 'classnames';
import Field from '../../../../internal/FormFields/Field';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { ExpirationDateProps } from './types';
import styles from '../CardInput.module.scss';
import DataSfSpan from './DataSfSpan';

import {
    DATE_POLICY_HIDDEN,
    DATE_POLICY_OPTIONAL,
    DATE_POLICY_REQUIRED,
    ENCRYPTED_EXPIRY_DATE
} from '../../../../internal/SecuredFields/lib/configuration/constants';
import useImage from '../../../../../core/Context/useImage';
import { alternativeLabelContent } from './IframeLabelAlternative';

export default function ExpirationDate(props: ExpirationDateProps) {
    const {
        label,
        focused,
        filled,
        onFocusField,
        className = '',
        error = '',
        isValid = false,
        expiryDatePolicy = DATE_POLICY_REQUIRED,
        showContextualElement,
        contextualText
    } = props;
    const { i18n } = useCoreContext();
    const getImage = useImage();

    const fieldClassnames = classNames(className, {
        'adyen-checkout__field__exp-date': true,
        [styles['adyen-checkout__card__exp-date__input--hidden']]: expiryDatePolicy === DATE_POLICY_HIDDEN,
        'adyen-checkout__field__exp-date--optional': expiryDatePolicy === DATE_POLICY_OPTIONAL
    });

    const fieldLabel = expiryDatePolicy !== DATE_POLICY_OPTIONAL ? label : `${label} ${i18n.get('field.title.optional')}`;

    return (
        <Field
            label={fieldLabel}
            classNameModifiers={['expiryDate']}
            className={fieldClassnames}
            focused={focused}
            filled={filled}
            onFocusField={() => onFocusField(ENCRYPTED_EXPIRY_DATE)}
            errorMessage={error}
            isValid={isValid}
            dir={'ltr'}
            name={'encryptedExpiryDate'}
            i18n={i18n}
            errorVisibleToScreenReader={false}
            useLabelElement={false}
            renderAlternativeToLabel={alternativeLabelContent}
            showContextualElement={showContextualElement}
            contextualText={contextualText}
        >
            <DataSfSpan
                encryptedFieldType={ENCRYPTED_EXPIRY_DATE}
                className={classNames(
                    'adyen-checkout__input',
                    'adyen-checkout__input--small',
                    'adyen-checkout__card__exp-date__input',
                    [styles['adyen-checkout__input']],
                    {
                        'adyen-checkout__input--error': error,
                        'adyen-checkout__input--focus': focused,
                        'adyen-checkout__input--valid': isValid
                    }
                )}
            />
            <span
                className={classNames('adyen-checkout__field__exp-date_hint_wrapper', [styles['checkout__field__exp-date_hint_wrapper']], {
                    'adyen-checkout__field__exp-date_hint_wrapper--hidden': error || isValid
                })}
            >
                <img
                    src={getImage({ imageFolder: 'components/' })('expiry_date_hint')}
                    className="adyen-checkout__field__exp-date_hint"
                    alt={fieldLabel}
                />
            </span>
        </Field>
    );
}
