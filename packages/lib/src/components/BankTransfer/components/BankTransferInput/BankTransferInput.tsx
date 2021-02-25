import { h } from 'preact';
import useCoreContext from '../../../../core/Context/useCoreContext';
import './BankTransferInput.scss';
import SendCopyToEmail from '../../../internal/SendCopyToEmail/SendCopyToEmail';
import { useEffect, useState } from 'preact/hooks';
import useForm from '../../../../utils/useForm';

function BankTransferInput(props) {
    const { i18n } = useCoreContext();
    const [showingEmail, setShowingEmail] = useState(false);

    const { handleChangeFor, triggerValidation, data, valid, errors, isValid, setSchema } = useForm({
        schema: [],
        defaultData: props.data
    });

    const toggleEmailField = () => setShowingEmail(!showingEmail);

    useEffect(() => {
        const newSchema = showingEmail ? ['shopperEmail'] : [];
        setSchema(newSchema);
    }, [showingEmail]);

    this.showValidation = triggerValidation;

    useEffect(() => {
        props.onChange({ data, errors, valid, isValid });
    }, [data, valid, errors, showingEmail, isValid]);

    return (
        <div className="adyen-checkout__bankTransfer">
            <p className="adyen-checkout__bankTransfer__introduction">{i18n.get('bankTransfer.introduction')}</p>
            <SendCopyToEmail
                classNames={'adyen-checkout__bankTransfer__emailField'}
                value={data.shopperEmail}
                errors={errors.shopperEmail}
                onToggle={toggleEmailField}
                onInput={handleChangeFor('shopperEmail', 'input')}
                onChange={handleChangeFor('shopperEmail', 'blur')}
            />
        </div>
    );
}

export default BankTransferInput;
