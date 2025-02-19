import { h } from 'preact';
import LoadingWrapper from '../../internal/LoadingWrapper';
import SegmentedControl from '../../internal/SegmentedControl';
import { useState } from 'preact/hooks';
import { SegmentedControlOptions } from '../../internal/SegmentedControl/SegmentedControl';
import PayIDInput from './PayIDInput';
import BSBInput from './BSBInput';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import { ComponentMethodsRef, UIElementStatus } from '../../internal/UIElement/types';
import { PayToData, PayToPlaceholdersType } from '../types';
import { PayButtonProps } from '../../internal/PayButton/PayButton';
import classNames from 'classnames';
import './PayToComponent.scss';

export type PayToInputOption = 'payid-option' | 'bsb-option';

export type PayToComponentData = { selectedInput: PayToInputOption };

const inputOptions: SegmentedControlOptions<PayToInputOption> = [
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

export interface PayToComponentProps {
    showPayButton: boolean;
    onChange: (e) => void;
    setComponentRef: (ref: ComponentMethodsRef) => void;
    data: PayToData;
    placeholders: PayToPlaceholdersType;
    payButton: (props: Partial<PayButtonProps>) => h.JSX.Element;
}

export default function PayToComponent(props: PayToComponentProps) {
    const { i18n } = useCoreContext();

    const [status, setStatus] = useState<UIElementStatus>('ready');

    const defaultOption = inputOptions[0].value;
    const [selectedInput, setSelectedInput] = useState<PayToInputOption>(defaultOption);

    const onChange = ({ data, valid, errors, isValid }) => {
        // merge selected input to as data, this keep the input layers untouched
        props.onChange({ data: { selectedInput: selectedInput, ...data }, valid, errors, isValid });
    };

    return (
        <LoadingWrapper>
            <div
                className={classNames({
                    'adyen-checkout__payto-component': true,
                    'adyen-checkout__payto-component--loading': status === 'loading'
                })}
            >
                <SegmentedControl selectedValue={selectedInput} options={inputOptions} onChange={setSelectedInput} />
                {selectedInput === 'payid-option' && (
                    <PayIDInput
                        status={status}
                        setStatus={setStatus}
                        setComponentRef={props.setComponentRef}
                        onChange={onChange}
                        defaultData={props.data}
                        placeholders={props.placeholders}
                    />
                )}
                {selectedInput === 'bsb-option' && (
                    <BSBInput
                        status={status}
                        setStatus={setStatus}
                        setComponentRef={props.setComponentRef}
                        onChange={onChange}
                        defaultData={props.data}
                        placeholders={props.placeholders}
                    />
                )}

                {props.showPayButton && props.payButton({ status, label: i18n.get('continue') })}
            </div>
        </LoadingWrapper>
    );
}
