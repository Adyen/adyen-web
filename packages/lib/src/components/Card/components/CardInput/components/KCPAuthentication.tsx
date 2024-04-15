import { h } from 'preact';
import { useMemo } from 'preact/hooks';
import classNames from 'classnames';
import Field from '../../../../internal/FormFields/Field';
import { useCoreContext } from '../../../../../core/Context/CoreProvider';
import { KCPProps } from './types';
import DataSfSpan from './DataSfSpan';
import InputTelephone from '../../../../internal/FormFields/InputTelephone';
import { alternativeLabelContent } from './IframeLabelAlternative';
import { CREDITCARD_TAX_NUMBER_INVALID } from '../../../../../core/Errors/constants';

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
                errorMessage={props.error && i18n.get(CREDITCARD_TAX_NUMBER_INVALID)}
                isValid={props.isValid}
                dir={'ltr'}
                name={'kcpTaxNumberOrDOB'}
                onFocus={e => props.onFieldFocusAnalytics('taxNumber', e)}
                onBlur={e => props.onFieldBlurAnalytics('taxNumber', e)}
            >
                <InputTelephone
                    name={'kcpTaxNumberOrDOB'}
                    className="adyen-checkout__card__kcp-taxNumber__input adyen-checkout__input"
                    maxLength={10}
                    minLength={6}
                    autoComplete={'false'}
                    value={props.value}
                    required={true}
                    onBlur={props.onBlur}
                    onInput={props.onInput}
                    disabled={props.disabled}
                    placeholder={props.placeholder}
                />
            </Field>

            <Field
                label={i18n.get('creditCard.password.label')}
                focused={props.focusedElement === 'encryptedPassword'}
                filled={props.filled}
                classNameModifiers={['50', 'koreanAuthentication-encryptedPassword']}
                onFocusField={() => props.onFocusField('encryptedPassword')}
                errorMessage={props.encryptedPasswordState.errors && i18n.get(String(props.encryptedPasswordState.errors))}
                isValid={props.encryptedPasswordState.valid}
                dir={'ltr'}
                name={'encryptedPassword'}
                useLabelElement={false}
                renderAlternativeToLabel={alternativeLabelContent}
            >
                <DataSfSpan
                    encryptedFieldType="encryptedPassword"
                    className={classNames({
                        'adyen-checkout__input': true,
                        'adyen-checkout__input--large': true,
                        'adyen-checkout__input--error': props.encryptedPasswordState.errors,
                        'adyen-checkout__input--valid': props.encryptedPasswordState.valid,
                        'adyen-checkout__input--focus': props.focusedElement === 'encryptedPassword'
                    })}
                />
            </Field>
        </div>
    );
}
