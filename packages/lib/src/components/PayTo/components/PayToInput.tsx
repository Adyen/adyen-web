import { h } from 'preact';
import LoadingWrapper from '../../internal/LoadingWrapper';
import SegmentedControl from '../../internal/SegmentedControl';
import { useState } from 'preact/hooks';
import { SegmentedControlOptions } from '../../internal/SegmentedControl/SegmentedControl';
import PayIDInput from './PayIDInput';
import BSBInput from './BSBInput';

const inputOptions: SegmentedControlOptions<any> = [
    {
        value: 'payid-option',
        label: 'PayID',
        htmlProps: {
            id: 'payid-option', // TODO move this to i18n
            'aria-controls': 'payid-input',
            'aria-expanded': true // TODO move this logic to segmented controller
        }
    },
    {
        value: 'bsb-option',
        label: 'BSB and account number', // TODO move this to i18n
        htmlProps: {
            id: 'bsb-option',
            'aria-controls': 'bsb-input',
            'aria-expanded': false // TODO move this logic to segmented controller
        }
    }
];

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

    const defaultOption = inputOptions[0].value;
    const [selectedInput, setSelectedInput] = useState<string>(defaultOption);

    return (
        <LoadingWrapper>
            <SegmentedControl selectedValue={selectedInput} options={inputOptions} onChange={setSelectedInput} />
            {selectedInput === 'payid-option' && <PayIDInput />}
            {selectedInput === 'bsb-option' && <BSBInput />}
        </LoadingWrapper>
    );
}
