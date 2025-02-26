import { h } from 'preact';
import SegmentedControl from '../../internal/SegmentedControl';
import { useMemo, useState } from 'preact/hooks';
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

    const inputOptions: SegmentedControlOptions<PayToInputOption> = useMemo(
        () => [
            {
                value: 'payid-option',
                label: 'PayID',
                id: 'payid-option',
                controls: 'payid-input'
            },
            {
                value: 'bsb-option',
                label: i18n.get('payto.bsb.option.label'),
                id: 'bsb-option',
                controls: 'bsb-input'
            }
        ],
        [i18n]
    );

    const defaultOption = inputOptions[0].value;
    const [selectedInput, setSelectedInput] = useState<PayToInputOption>(defaultOption);

    const onChange = ({ data, valid, errors, isValid }) => {
        // merge selected input to as data, this keep the input layers untouched
        props.onChange({ data: { selectedInput: selectedInput, ...data }, valid, errors, isValid });
    };

    return (
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
    );
}
