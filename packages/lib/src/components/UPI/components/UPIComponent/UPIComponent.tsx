import { Fragment, h, RefObject } from 'preact';
import { useCallback, useRef, useState } from 'preact/hooks';
import ContentSeparator from '../../../internal/ContentSeparator';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { PayButtonFunctionProps, UIElementStatus } from '../../../types';
import { VpaInputHandlers } from '../VpaInput/VpaInput';
import ButtonGroup from '../ButtonGroup';
import { UpiFlow } from '../../types';

interface UPIComponentProps {
    payButton: (props: PayButtonFunctionProps) => h.JSX.Element;
    ref: (ref: RefObject<typeof UPIComponent>) => void;
    onChange: ({ data: VpaInputDataState, valid, errors, isValid: boolean }) => void;
    onSubmit(): void;
    onUpdatePaymentFlow(flow: UpiFlow): void;
}

export default function UPIComponent({ onChange, onUpdatePaymentFlow, payButton }: UPIComponentProps): h.JSX.Element {
    const { i18n, loadingContext } = useCoreContext();
    const inputRef = useRef<VpaInputHandlers>(null);
    const [status, setStatus] = useState<UIElementStatus>('ready');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<UpiFlow>();

    this.setStatus = (status, isQrCodeFlow) => {
        // setIsQrCodeFlow(isQrCodeFlow);
        setStatus(status);
    };

    this.showValidation = () => {
        inputRef.current.validateInput();
    };

    // const isSubmittingAndFlowIsQrCode = useMemo(() => status === 'loading' && isQrCodeFlow, [status, isQrCodeFlow]);
    //
    const onSelectPaymentMethodType = useCallback(
        (flow: UpiFlow) => {
            onUpdatePaymentFlow(flow);
            setSelectedPaymentMethod(flow);
        },
        [onUpdatePaymentFlow]
    );

    return (
        <Fragment>
            <ButtonGroup>
                <ButtonGroup.Button selected={selectedPaymentMethod === UpiFlow.VPA} onClick={() => onSelectPaymentMethodType(UpiFlow.VPA)}>
                    Virtual Payment Address
                </ButtonGroup.Button>
                <ButtonGroup.Button selected={selectedPaymentMethod === UpiFlow.QR_CODE} onClick={() => onSelectPaymentMethodType(UpiFlow.QR_CODE)}>
                    QR Code
                </ButtonGroup.Button>
            </ButtonGroup>

            <ContentSeparator label={i18n.get('qrCodeOrApp')} />

            {/*<VpaInput disabled={status === 'loading'} ref={inputRef} onChange={onChange} />*/}

            {/*{payButton({*/}
            {/*    label: `${i18n.get('continue')}`,*/}
            {/*    status: isSubmittingAndFlowIsQrCode ? 'default' : status,*/}
            {/*    disabled: status === 'loading'*/}
            {/*})}*/}

            {/*<ContentSeparator label={i18n.get('qrCodeOrApp')} />*/}

            {/*<Button*/}
            {/*    icon={getImage({ loadingContext: loadingContext, imageFolder: 'components/' })('qr_dark')}*/}
            {/*    status={isSubmittingAndFlowIsQrCode ? 'loading' : 'default'}*/}
            {/*    disabled={status === 'loading'}*/}
            {/*    variant="secondary"*/}
            {/*    label={i18n.get('generateQRCode')}*/}
            {/*    onClick={onGenerateQrCodeClick}*/}
            {/*/>*/}
        </Fragment>
    );
}
