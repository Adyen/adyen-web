import { h } from 'preact';
//import { useCoreContext } from '../../../core/Context/CoreProvider';
import Fieldset from '../../internal/FormFields/Fieldset';

export default function PayIDInput() {
    // const { i18n } = useCoreContext();

    // TODO type this
    // const { handleChangeFor, triggerValidation, data, valid, errors } = useForm<any>({
    //     schema: ['beneficiaryId']
    // });
    //
    // const [status, setStatus] = useState<string>('ready');

    // this.setStatus = setStatus;
    // this.showValidation = triggerValidation;

    return (
        <Fieldset classNameModifiers={['adyen-checkout-payto__payid_input']} label={'payto.payid.header'} description={'payto.payid.description'}>
            <p></p>
        </Fieldset>
    );
}
