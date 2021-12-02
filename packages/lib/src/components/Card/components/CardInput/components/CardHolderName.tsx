import { h } from 'preact';
import Field from '../../../../internal/FormFields/Field';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { renderFormField } from '../../../../internal/FormFields';
import { CardHolderNameProps } from './types';
import styles from '../CardInput.module.scss';

export default function CardHolderName({
    onChange,
    onInput,
    placeholder,
    value,
    required,
    error = false,
    isValid,
    isCollatingErrors
}: CardHolderNameProps) {
    const { i18n } = useCoreContext();

    return (
        <Field
            label={i18n.get('creditCard.holderName')}
            className={'adyen-checkout__card__holderName'}
            errorMessage={error && i18n.get('creditCard.holderName.invalid')}
            isValid={!!isValid}
            name={'holderName'}
            isCollatingErrors={isCollatingErrors}
        >
            {renderFormField('text', {
                name: 'holderName',
                className: `adyen-checkout__card__holderName__input ${styles['adyen-checkout__input']}`,
                placeholder: placeholder || i18n.get('creditCard.holderName.placeholder'),
                value,
                required,
                onChange,
                onInput,
                isCollatingErrors
            })}
        </Field>
    );
}
