import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import { renderFormField } from '../../../../internal/FormFields';
import classNames from 'classnames';
import Field from '../../../../internal/FormFields/Field';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { KCPProps } from './types';
import styles from '../CardInput.module.scss';
import DataSfSpan from './DataSfSpan';

export default function KCPAuthentication(props: KCPProps) {
    const { i18n } = useCoreContext();

    const taxNumberLabel = useMemo((): string => {
        if (props.value?.length > 6) return i18n.get('creditCard.taxNumber.labelAlt');

        return i18n.get('creditCard.taxNumber.label');
    }, [props.value]);

    return (
        <div className="adyen-checkout__card__kcp-authentication">
            <Field
                label={taxNumberLabel}
                filled={props.filled}
                classNameModifiers={['kcp-taxNumber']}
                errorMessage={props.error && i18n.get('creditCard.taxNumber.invalid')}
                isValid={props.isValid}
                dir={'ltr'}
                name={'kcpTaxNumberOrDOB'}
            >
                {renderFormField('tel', {
                    name: 'kcpTaxNumberOrDOB',
                    className: `adyen-checkout__card__kcp-taxNumber__input ${styles['adyen-checkout__input']}`,
                    maxLength: 10,
                    minLength: 6,
                    autoComplete: false,
                    value: props.value,
                    required: true,
                    onBlur: props.onBlur,
                    onInput: props.onInput,
                    disabled: props.disabled
                })}
            </Field>

            <Field
                label={i18n.get('creditCard.encryptedPassword.label')}
                focused={props.focusedElement === 'encryptedPassword'}
                filled={props.filled}
                classNameModifiers={['50', 'koreanAuthentication-encryptedPassword']}
                onFocusField={() => props.onFocusField('encryptedPassword')}
                errorMessage={props.encryptedPasswordState.errors && i18n.get(String(props.encryptedPasswordState.errors))}
                isValid={props.encryptedPasswordState.valid}
                dir={'ltr'}
                name={'encryptedPassword'}
            >
                <DataSfSpan
                    encryptedFieldType="encryptedPassword"
                    className={classNames({
                        'adyen-checkout__input': true,
                        'adyen-checkout__input--large': true,
                        [styles['adyen-checkout__input']]: true,
                        'adyen-checkout__input--error': props.encryptedPasswordState.errors,
                        'adyen-checkout__input--valid': props.encryptedPasswordState.valid,
                        'adyen-checkout__input--focus': props.focusedElement === 'encryptedPassword'
                    })}
                />
            </Field>
        </div>
    );
}
