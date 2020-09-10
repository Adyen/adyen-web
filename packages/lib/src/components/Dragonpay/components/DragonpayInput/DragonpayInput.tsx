import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { renderFormField } from '../../../internal/FormFields';
import Field from '../../../internal/FormFields/Field';
import { isValidEmail } from './validate';
import getIssuerImageUrl from '../../../../utils/get-issuer-image';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { DragonpayInputData, DragonpayInputIssuerItem, DragonpayInputProps, DragonpayInputErrors } from '../../types';

export default function DragonpayInput(props: DragonpayInputProps) {
    const { i18n } = useCoreContext();
    const [isValid, setIsValid] = useState<boolean>(false);
    const [data, setData] = useState<DragonpayInputData>({ ...props.data, ...(props.issuer && { issuer: props.issuer }) });
    const [errors, setErrors] = useState<DragonpayInputErrors>({});

    const getIssuerIcon = getIssuerImageUrl({}, props.type);
    const items = props.items.map(
        (item: DragonpayInputIssuerItem): DragonpayInputIssuerItem => ({
            ...item,
            icon: getIssuerIcon(item.id && item.id.toLowerCase())
        })
    );

    const isIssuerRequired = () => {
        const typesRequiringIssuers = ['dragonpay_ebanking', 'dragonpay_otc_banking', 'dragonpay_otc_non_banking'];
        return typesRequiringIssuers.indexOf(props.type) > -1;
    };

    const validateFields = (shopperEmail, issuer) => {
        return isValidEmail(shopperEmail) && (!!issuer || !isIssuerRequired());
    };

    const handleInputShopperEmail = e => {
        const shopperEmail = e.target.value;
        setIsValid(validateFields(shopperEmail, data.issuer));
        setData({ ...data, shopperEmail });
        setErrors({ ...errors, shopperEmail: false });
    };

    const handleSelectIssuer = e => {
        const issuer = e.currentTarget.getAttribute('data-value');
        setIsValid(validateFields(data.shopperEmail, issuer));
        setData({ ...data, issuer });
        setErrors({ ...errors, issuer: false });
    };

    const getIssuerSelectFieldKey = type => {
        if (type === 'dragonpay_otc_non_banking') {
            return 'dragonpay.voucher.non.bank.selectField.placeholder';
        }
        return 'dragonpay.voucher.bank.selectField.placeholder';
    };

    useEffect(() => {
        if (props.issuer) {
            props.onChange({ isValid, data, errors });
        }
    }, []);

    useEffect(() => {
        props.onChange({ isValid, data, errors });
    }, [isValid, data, errors]);

    const [status, setStatus] = useState('ready');

    this.setStatus = newStatus => {
        setStatus(newStatus);
    };

    this.showValidation = () => {
        setErrors({
            shopperEmail: !isValidEmail(data.shopperEmail),
            issuer: !data.issuer
        });
    };

    return (
        <div className="adyen-checkout__dragonpay-input__field">
            <Field label={i18n.get('shopperEmail')} errorMessage={errors.shopperEmail}>
                {renderFormField('emailAddress', {
                    name: 'dragonpay.shopperEmail',
                    autoCorrect: 'off',
                    value: data.shopperEmail,
                    className: 'adyen-checkout__input--large',
                    spellCheck: false,
                    onInput: handleInputShopperEmail
                })}
            </Field>

            {isIssuerRequired() && (
                <Field label={i18n.get(getIssuerSelectFieldKey(props.type))} errorMessage={errors.issuer}>
                    {renderFormField('select', {
                        items,
                        selected: data.issuer,
                        placeholder: i18n.get(getIssuerSelectFieldKey(props.type)),
                        name: 'issuer',
                        className: 'adyen-checkout__dropdown--large adyen-checkout__issuer-list__dropdown',
                        onChange: handleSelectIssuer
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
