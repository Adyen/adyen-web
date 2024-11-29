import { h } from 'preact';
import Fieldset from '../../internal/FormFields/Fieldset';
import IdentifierSelector, { PayToIdentifierEnum, PayToPayIDInputIdentifierValues } from './IdentifierSelector';
import { useState } from 'preact/hooks';
import useForm from '../../../utils/useForm';
import PayToPhone from './PayToPhone';
import InputEmail from '../../internal/FormFields/InputEmail';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import Field from '../../internal/FormFields/Field';
import { useCoreContext } from '../../../core/Context/CoreProvider';

export default function PayIDInput(props) {
    const { i18n } = useCoreContext();

    // TODO type this
    const { handleChangeFor, triggerValidation, data, valid, errors } = useForm<any>({
        schema: ['beneficiaryId']
    });

    // this.setStatus = setStatus;
    // this.showValidation = triggerValidation;

    const [selectedIdentifier, setSelectedIdentifier] = useState<PayToPayIDInputIdentifierValues>(PayToIdentifierEnum.phone);
    console.log(selectedIdentifier);

    return (
        <Fieldset classNameModifiers={['adyen-checkout-payto__payid_input']} label={'payto.payid.header'} description={'payto.payid.description'}>
            <IdentifierSelector onSelectedIdentifier={setSelectedIdentifier} selectedIdentifier={selectedIdentifier} />
            {selectedIdentifier === PayToIdentifierEnum.phone && (
                <PayToPhone onChange={handleChangeFor('phone')} onError={props.onError} data={data} />
            )}

            {selectedIdentifier === PayToIdentifierEnum.email && (
                <div>
                    <Field
                        label={i18n.get('shopperEmail')}
                        classNameModifiers={['email']}
                        errorMessage={getErrorMessage(i18n, errors.shopperEmail, i18n.get('shopperEmail'))}
                        dir={'ltr'}
                        name={'email'}
                        i18n={i18n}
                    >
                        <InputEmail
                            name={'email'}
                            value={data.email}
                            onInput={handleChangeFor('email', 'input')}
                            onBlur={handleChangeFor('email', 'blur')}
                            //TODO placeholder={placeholders.shopperEmail}
                            required={true}
                        />
                    </Field>
                </div>
            )}
        </Fieldset>
    );
}
