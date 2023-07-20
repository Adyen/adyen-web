import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import useForm from '../../../../utils/useForm';
import { renderFormField } from '../../../internal/FormFields';
import Field from '../../../internal/FormFields/Field';
import getIssuerImageUrl from '../../../../utils/get-issuer-image';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { DragonpayInputData, DragonpayInputIssuerItem, DragonpayInputProps } from '../../types';
import { personalDetailsValidationRules } from '../../../internal/PersonalDetails/validate';

export default function DragonpayInput(props: DragonpayInputProps) {
    const { i18n } = useCoreContext();
    const isIssuerRequired = () => {
        const typesRequiringIssuers = ['dragonpay_ebanking', 'dragonpay_otc_banking', 'dragonpay_otc_non_banking'];
        return typesRequiringIssuers.indexOf(props.type) > -1;
    };

    const { handleChangeFor, triggerValidation, data, valid, errors, isValid } = useForm<DragonpayInputData>({
        schema: [...(isIssuerRequired() ? ['issuer'] : []), 'shopperEmail'],
        rules: {
            issuer: {
                validate: issuer => isIssuerRequired() && !!issuer,
                modes: ['input', 'blur']
            },
            shopperEmail: personalDetailsValidationRules.shopperEmail
        }
    });

    const getIssuerIcon = getIssuerImageUrl({}, props.type);
    const items = props.items.map(
        (item: DragonpayInputIssuerItem): DragonpayInputIssuerItem => ({
            ...item,
            icon: getIssuerIcon(item.id && item.id.toLowerCase())
        })
    );

    const getIssuerSelectFieldKey = type => {
        if (type === 'dragonpay_otc_non_banking') {
            return 'dragonpay.voucher.non.bank.selectField.placeholder';
        }
        return 'dragonpay.voucher.bank.selectField.placeholder';
    };

    useEffect(() => {
        props.onChange({ isValid, data, valid, errors });
    }, [isValid, data, valid, errors]);

    const [status, setStatus] = useState('ready');
    this.setStatus = setStatus;
    this.showValidation = triggerValidation;

    return (
        <div className="adyen-checkout__dragonpay-input__field">
            <Field label={i18n.get('shopperEmail')} errorMessage={!!errors.shopperEmail} name={'dragonpay-shopperEmail'}>
                {renderFormField('emailAddress', {
                    name: 'dragonpay-shopperEmail',
                    autoCorrect: 'off',
                    value: data.shopperEmail,
                    className: 'adyen-checkout__input--large',
                    spellCheck: false,
                    onInput: handleChangeFor('shopperEmail', 'input'),
                    onBlur: handleChangeFor('shopperEmail', 'blur')
                })}
            </Field>

            {isIssuerRequired() && (
                <Field label={i18n.get(getIssuerSelectFieldKey(props.type))} errorMessage={!!errors.issuer} name={'issuer'}>
                    {renderFormField('select', {
                        items,
                        selected: data.issuer,
                        name: 'issuer',
                        className: 'adyen-checkout__dropdown--large adyen-checkout__issuer-list__dropdown',
                        onChange: handleChangeFor('issuer')
                    })}
                </Field>
            )}

            {props.showPayButton && props.payButton({ status, label: i18n.get('confirmPurchase') })}
        </div>
    );
}

DragonpayInput.defaultProps = {
    data: {},
    items: [],
    onChange: () => {}
};
