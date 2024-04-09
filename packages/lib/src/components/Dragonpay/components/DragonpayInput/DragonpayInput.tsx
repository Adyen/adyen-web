import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import useForm from '../../../../utils/useForm';
import Field from '../../../internal/FormFields/Field';
import getIssuerImageUrl from '../../../../utils/get-issuer-image';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { DragonpayInputData, DragonpayInputIssuerItem, DragonpayInputProps } from '../../types';
import InputEmail from '../../../internal/FormFields/InputEmail';
import Select from '../../../internal/FormFields/Select';
import useImage from '../../../../core/Context/useImage';
import { validationRules } from '../../../../utils/Validator/defaultRules';
import { getErrorMessage } from '../../../../utils/getErrorMessage';

export default function DragonpayInput(props: DragonpayInputProps) {
    const { i18n } = useCoreContext();
    const getImage = useImage();
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
            shopperEmail: validationRules.emailRule
        }
    });

    const getIssuerIcon = getIssuerImageUrl({}, props.type, getImage);
    const items = props.items.map(
        (item: DragonpayInputIssuerItem): DragonpayInputIssuerItem => ({
            ...item,
            icon: getIssuerIcon(item.id && item.id.toLowerCase())
        })
    );

    const getIssuerSelectFieldKey = type => {
        if (type === 'dragonpay_otc_non_banking') {
            return 'dragonpayVoucher.selectField.contextualText.nonBank';
        }
        return 'dragonpayVoucher.selectField.contextualText.bank';
    };

    useEffect(() => {
        props.onChange({ isValid, data, valid, errors });
    }, [isValid, data, valid, errors]);

    const [status, setStatus] = useState('ready');
    this.setStatus = setStatus;
    this.showValidation = triggerValidation;

    return (
        <div className="adyen-checkout__dragonpay-input__field">
            <Field
                label={i18n.get('shopperEmail')}
                errorMessage={getErrorMessage(i18n, errors.shopperEmail, i18n.get('shopperEmail'))}
                name={'dragonpay-shopperEmail'}
            >
                <InputEmail
                    name={'dragonpay-shopperEmail'}
                    autoCorrect={'off'}
                    value={data.shopperEmail}
                    className={'adyen-checkout__input--large'}
                    spellCheck={false}
                    onInput={handleChangeFor('shopperEmail', 'input')}
                    onBlur={handleChangeFor('shopperEmail', 'blur')}
                />
            </Field>

            {isIssuerRequired() && (
                <Field label={i18n.get(getIssuerSelectFieldKey(props.type))} errorMessage={!!errors.issuer} name={'issuer'}>
                    <Select
                        items={items}
                        selectedValue={data.issuer}
                        name={'issuer'}
                        className={'adyen-checkout__dropdown--large adyen-checkout__issuer-list__dropdown'}
                        onChange={handleChangeFor('issuer')}
                    />
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
