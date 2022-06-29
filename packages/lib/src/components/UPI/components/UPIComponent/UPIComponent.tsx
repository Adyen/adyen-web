import { h, Fragment, RefObject } from 'preact';
import { useMemo, useRef, useState } from 'preact/hooks';
import VpaInput from '../VpaInput';
import ContentSeparator from '../../../internal/ContentSeparator';
import Button from '../../../internal/Button';
import useCoreContext from '../../../../core/Context/useCoreContext';
import getImage from '../../../../utils/get-image';
import { PayButtonFunctionProps, UIElementStatus } from '../../../types';
import { VpaInputHandlers } from '../VpaInput/VpaInput';

interface UPIComponentProps {
    payButton: (props: PayButtonFunctionProps) => h.JSX.Element;
    ref: (ref: RefObject<typeof UPIComponent>) => void;
    onChange: ({ data: VpaInputDataState, valid, errors, isValid: boolean }) => void;
    onSubmit(): void;
    onGenerateQrCodeClick(): void;
}

export default function UPIComponent({ onChange, onGenerateQrCodeClick, payButton }: UPIComponentProps): h.JSX.Element {
    const { i18n, loadingContext } = useCoreContext();
    const inputRef = useRef<VpaInputHandlers>(null);
    const [status, setStatus] = useState<UIElementStatus>('ready');
    const [isQrCodeFlow, setIsQrCodeFlow] = useState<boolean>(false);

    this.setStatus = (status, isQrCodeFlow) => {
        setStatus(status);
        setIsQrCodeFlow(isQrCodeFlow);
    };

    this.showValidation = () => {
        inputRef.current.validateInput();
    };

    const isSubmittingAndFlowIsQrCode = useMemo(() => status === 'loading' && isQrCodeFlow, [status, isQrCodeFlow]);

    return (
        <Fragment>
            <VpaInput ref={inputRef} onChange={onChange} />

            {payButton({
                label: `${i18n.get('continue')}`,
                status: isSubmittingAndFlowIsQrCode ? 'default' : status,
                disabled: isSubmittingAndFlowIsQrCode
            })}

            <ContentSeparator label="or" />

            <Button
                icon={getImage({ loadingContext: loadingContext, imageFolder: 'components/' })('qr_dark')}
                status={isSubmittingAndFlowIsQrCode ? 'loading' : 'default'}
                disabled={status === 'loading' && isQrCodeFlow === false}
                variant="secondary"
                label="Generate QR code"
                onClick={onGenerateQrCodeClick}
            />
        </Fragment>
    );
}
