import { h } from 'preact';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import styles from '../CardInput.module.scss';
import { renderFormField } from '../../../../internal/FormFields';
import Field from '../../../../internal/FormFields/Field';

const CardHolderName = ({ onChange, placeholder, value, required, error = false, isValid }) => {
    const { i18n } = useCoreContext();

    return (
        <Field
            label={i18n.get('creditCard.holderName')}
            className={'adyen-checkout__card__holderName'}
            errorMessage={error && i18n.get('creditCard.holderName.invalid')}
            isValid={!!isValid}
        >
            {renderFormField('text', {
                className: `adyen-checkout__card__holderName__input ${styles['adyen-checkout__input']}`,
                placeholder: placeholder || i18n.get('creditCard.holderName.placeholder'),
                value,
                required,
                onInput: onChange
            })}
        </Field>
    );
};

export default CardHolderName;
