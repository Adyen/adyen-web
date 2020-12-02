import { h } from 'preact';
import useCoreContext from '../../../../core/Context/useCoreContext';
import './BankTransferInput.scss';
import SendCopyToEmail from '../../../Boleto/components/BoletoInput/SendCopyToEmail';
import { useEffect, useState } from 'preact/hooks';
import Validator from '../../../../utils/Validator';

const validator = new Validator({});

function BankTransferInput(props) {
    const { i18n } = useCoreContext();
    const [errors, setErrors] = useState({ shopperEmail: false });
    const [data, setData] = useState({ shopperEmail: null });
    const [valid, setValid] = useState({ shopperEmail: false });
    const [showingEmail, setShowingEmail] = useState(false);

    const toggleEmailField = () => setShowingEmail(!showingEmail);

    const updateFieldData = (key, value, isValid) => {
        setData({ ...data, [key]: value });
        setValid({ ...valid, [key]: isValid });
        setErrors({ ...errors, [key]: !isValid });
    };

    const handleInputFor = key => e => {
        const { value } = e.target;
        const isValid = validator.validate(key, 'input')(value);

        updateFieldData(key, value, isValid);
    };

    const handleChangeFor = key => e => {
        const { value } = e.target;
        const isValid = validator.validate(key, 'blur')(value);

        updateFieldData(key, value, isValid);
    };

    this.showValidation = () => {
        setErrors({
            ...(showingEmail && { shopperEmail: !validator.validate('shopperEmail')(data.shopperEmail) })
        });
    };

    useEffect(() => {
        const emailRequired = showingEmail && props.showEmailAddress;
        const emailAddressValid = emailRequired ? Boolean(validator.validate('shopperEmail', 'blur')(data.shopperEmail)) : true;
        const shopperEmail = emailRequired ? data.shopperEmail : null;
        console.log(data);
        props.onChange({ data: { ...data, shopperEmail }, isValid: emailAddressValid });
    }, [data, valid, errors, showingEmail]);

    return (
        <div className="adyen-checkout__bankTransfer">
            <p className="adyen-checkout__bankTransfer__introduction">{i18n.get('bankTransfer.introduction')}</p>
            <SendCopyToEmail
                classNames={'adyen-checkout__bankTransfer__emailField'}
                value={data.shopperEmail}
                errors={errors.shopperEmail}
                onToggle={toggleEmailField}
                onInput={handleInputFor('shopperEmail')}
                onChange={handleChangeFor('shopperEmail')}
            />
        </div>
    );
}

export default BankTransferInput;
