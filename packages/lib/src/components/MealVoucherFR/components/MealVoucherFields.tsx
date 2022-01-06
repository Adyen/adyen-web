import Field from '../../internal/FormFields/Field';
import DataSfSpan from '../../Card/components/CardInput/components/DataSfSpan';
import classNames from 'classnames';
import styles from '../../Card/components/CardInput/CardInput.module.scss';
import { h } from 'preact';

export const MealVoucherFields = ({ setRootNode, i18n, sfpState, getCardErrorMessage, focusedElement, setFocusOn }) => {
    return (
        <div ref={setRootNode}>
            <Field
                label={i18n.get('creditCard.numberField.title')}
                classNameModifiers={['number', '100']}
                errorMessage={getCardErrorMessage(sfpState)}
                focused={focusedElement === 'encryptedCardNumber'}
                onFocusField={() => setFocusOn('encryptedCardNumber')}
                dir={'ltr'}
                name={'encryptedCardNumber'}
            >
                <DataSfSpan
                    encryptedFieldType="encryptedCardNumber"
                    data-info='{"length":"15-32", "maskInterval":4}'
                    className={classNames({
                        'adyen-checkout__input': true,
                        'adyen-checkout__input--large': true,
                        'adyen-checkout__card__cardNumber__input': true,
                        'adyen-checkout__input--error': getCardErrorMessage(sfpState),
                        'adyen-checkout__input--focus': focusedElement === 'encryptedCardNumber'
                    })}
                />
            </Field>

            <div className="adyen-checkout__field-wrapper">
                <Field
                    label={i18n.get('creditCard.expiryDateField.title')}
                    classNameModifiers={['expireDate', '50']}
                    errorMessage={sfpState.errors.encryptedExpiryDate && i18n.get(sfpState.errors.encryptedExpiryDate)}
                    focused={focusedElement === 'encryptedExpiryDate'}
                    onFocusField={() => setFocusOn('encryptedExpiryDate')}
                    dir={'ltr'}
                    name={'encryptedExpiryDate'}
                >
                    <DataSfSpan
                        encryptedFieldType={'encryptedExpiryDate'}
                        className={classNames(
                            'adyen-checkout__input',
                            'adyen-checkout__input--small',
                            'adyen-checkout__card__exp-date__input',
                            [styles['adyen-checkout__input']],
                            {
                                'adyen-checkout__input--error': sfpState.errors.encryptedExpiryDate,
                                'adyen-checkout__input--focus': focusedElement === 'encryptedExpiryDate',
                                'adyen-checkout__input--valid': !!sfpState.valid.encryptedExpiryMonth && !!sfpState.valid.encryptedExpiryYear
                            }
                        )}
                    />
                </Field>

                <Field
                    label={i18n.get('creditCard.pin.title')}
                    classNameModifiers={['pin', '50']}
                    errorMessage={sfpState.errors.encryptedSecurityCode && i18n.get(sfpState.errors.encryptedSecurityCode)}
                    focused={focusedElement === 'encryptedSecurityCode'}
                    onFocusField={() => setFocusOn('encryptedSecurityCode')}
                    dir={'ltr'}
                    name={'encryptedSecurityCode'}
                >
                    <DataSfSpan
                        encryptedFieldType="encryptedSecurityCode"
                        data-info='{"length":"3-10", "maskInterval": 0}'
                        className={classNames({
                            'adyen-checkout__input': true,
                            'adyen-checkout__input--large': true,
                            'adyen-checkout__card__cvc__input': true,
                            'adyen-checkout__input--error': sfpState.errors.encryptedSecurityCode,
                            'adyen-checkout__input--focus': focusedElement === 'encryptedSecurityCode'
                        })}
                    />
                </Field>
            </div>
        </div>
    );
};
