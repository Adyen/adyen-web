import { h } from 'preact';
import AchSFInput from './AchSFInput';
import useCoreContext from '../../../../../core/Context/useCoreContext';

const AchSecuredFields = ({ focusedElement, onFocusField, errors, valid, showContextualElement, contextualTexts }) => {
    const { i18n } = useCoreContext();

    return (
        <div className="adyen-checkout__ach-sf__form adyen-checkout__field-wrapper">
            <AchSFInput
                id="bankAccountNumber"
                focused={focusedElement === 'encryptedBankAccountNumber'}
                isValid={!!valid.encryptedBankAccountNumber}
                label={i18n.get('ach.accountNumberField.title')}
                onFocusField={onFocusField}
                filled={!!errors.encryptedBankAccountNumber || !!valid.encryptedBankAccountNumber}
                errorMessage={!!errors.encryptedBankAccountNumber && i18n.get(errors.encryptedBankAccountNumber)}
                dataInfo='{"length":"4-17"}'
                className={'adyen-checkout__field--50'}
                dir={'ltr'}
                showContextualElement={showContextualElement}
                contextualText={contextualTexts?.bankAccountNumber}
            />
            <AchSFInput
                id="bankLocationId"
                focused={focusedElement === 'encryptedBankLocationId'}
                isValid={!!valid.encryptedBankLocationId}
                label={i18n.get('ach.accountLocationField.title')}
                onFocusField={onFocusField}
                filled={!!errors.encryptedBankLocationId || !!valid.encryptedBankLocationId}
                errorMessage={!!errors.encryptedBankLocationId && i18n.get(errors.encryptedBankLocationId)}
                dataInfo='{"length":9}'
                className={'adyen-checkout__field--50'}
                dir={'ltr'}
                showContextualElement={showContextualElement}
                contextualText={contextualTexts?.bankLocationId}
            />
        </div>
    );
};

export default AchSecuredFields;
