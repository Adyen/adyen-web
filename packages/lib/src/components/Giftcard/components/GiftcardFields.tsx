import Field from '../../internal/FormFields/Field';
import DataSfSpan from '../../Card/components/CardInput/components/DataSfSpan';
import classNames from 'classnames';
import { h } from 'preact';

export const GiftCardFields = ({ setRootNode, i18n, pinRequired, sfpState, getCardErrorMessage, focusedElement, setFocusOn }) => {
    return (
        <div ref={setRootNode} className="adyen-checkout__field-wrapper">
            <Field
                label={i18n.get('creditCard.numberField.title')}
                classNameModifiers={['number', ...(pinRequired ? ['70'] : ['100'])]}
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

            {pinRequired && (
                <Field
                    label={i18n.get('creditCard.pin.title')}
                    classNameModifiers={['pin', '30']}
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
            )}
        </div>
    );
};
