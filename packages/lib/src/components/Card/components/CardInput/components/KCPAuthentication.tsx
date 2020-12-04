import { h } from 'preact';
import { useState, useEffect, useMemo } from 'preact/hooks';
import { renderFormField } from '../../../../internal/FormFields';
import classNames from 'classnames';
import Field from '../../../../internal/FormFields/Field';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { KCPErrors, KCPProps, RtnType_ParamBooleanFn, RtnType_ParamVoidFn } from './types';
import styles from '../CardInput.module.scss';

export default function KCPAuthentication(props: KCPProps) {
    const { i18n } = useCoreContext();

    const isTaxNumberValid: RtnType_ParamBooleanFn = (taxNumber = ''): boolean => taxNumber.length === 6 || taxNumber.length === 10;
    const [data, setData] = useState({ taxNumber: props.taxNumber });
    const [valid, setValid] = useState({ taxNumber: isTaxNumberValid(props.taxNumber) });
    const [errors, setErrors] = useState(({} as any) as KCPErrors);

    const taxNumberLabel = useMemo((): string => {
        if (data.taxNumber?.length > 6) return i18n.get('creditCard.taxNumber.labelAlt');

        return i18n.get('creditCard.taxNumber.label');
    }, [data.taxNumber]);

    const handleTaxNumber: RtnType_ParamVoidFn = (e: Event): void => {
        setData({ ...data, taxNumber: (e.target as HTMLInputElement).value });
        setValid({ ...valid, taxNumber: isTaxNumberValid((e.target as HTMLInputElement).value) });
        setErrors({ ...errors, taxNumber: false });
    };

    useEffect(() => {
        props.onChange(data, valid);
    }, [data.taxNumber]);

    // When "unmounting" clear any stored data
    useEffect(() => {
        return (): void => {
            props.onChange({ taxNumber: undefined }, { taxNumber: false });
        };
    }, []);

    this.showValidation = (): void => {
        setErrors({ taxNumber: !isTaxNumberValid(data.taxNumber) });
    };

    return (
        <div className="adyen-checkout__card__kcp-authentication">
            <Field
                label={taxNumberLabel}
                filled={props.filled}
                classNameModifiers={['kcp-taxNumber']}
                errorMessage={errors.taxNumber && i18n.get('creditCard.taxNumber.invalid')}
                isValid={valid.taxNumber}
            >
                {renderFormField('tel', {
                    className: `adyen-checkout__card__kcp-taxNumber__input ${styles['adyen-checkout__input']}`,
                    placeholder: i18n.get('creditCard.taxNumber.placeholder'),
                    maxLength: 10,
                    minLength: 6,
                    autoComplete: false,
                    value: data.taxNumber,
                    required: true,
                    onChange: handleTaxNumber,
                    onInput: handleTaxNumber
                })}
            </Field>

            <Field
                label={i18n.get('creditCard.encryptedPassword.label')}
                focused={props.focusedElement === 'encryptedPassword'}
                filled={props.filled}
                classNameModifiers={['50', 'koreanAuthentication-encryptedPassword']}
                onFocusField={() => props.onFocusField('encryptedPassword')}
                errorMessage={props.encryptedPasswordState.errors && i18n.get('creditCard.encryptedPassword.invalid')}
                isValid={props.encryptedPasswordState.valid}
            >
                <span
                    data-cse="encryptedPassword"
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
