import { h } from 'preact';
import Field from '../../../../internal/FormFields/Field';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { CardHolderNameProps } from './types';
import styles from '../CardInput.module.scss';
import InputText from '../../../../internal/FormFields/InputText';

export default function CardHolderName({ onBlur, onInput, placeholder, value, required, error = false, isValid, disabled }: CardHolderNameProps) {
    const { i18n } = useCoreContext();

    return (
        <Field
            label={i18n.get('creditCard.holderName')}
            className={'adyen-checkout__card__holderName'}
            errorMessage={error && i18n.get('creditCard.holderName.invalid')}
            isValid={!!isValid}
            name={'holderName'}
            i18n={i18n}
        >
            <InputText
                name={'holderName'}
                className={`adyen-checkout__card__holderName__input ${styles['adyen-checkout__input']}`}
                placeholder={placeholder}
                autocomplete={'cc-name'}
                {...{ value, required, onBlur, onInput, disabled }}
            />
        </Field>
    );
}
