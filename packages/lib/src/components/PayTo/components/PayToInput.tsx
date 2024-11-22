import { h } from 'preact';
import LoadingWrapper from '../../internal/LoadingWrapper';

export default function PayToInput() {
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
        <LoadingWrapper>
            <div>Input goes here</div>
        </LoadingWrapper>
    );
}
