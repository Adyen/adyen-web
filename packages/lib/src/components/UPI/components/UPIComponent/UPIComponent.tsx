import { Fragment, h, RefObject } from 'preact';
import { useCallback, useRef, useState } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { PayButtonFunctionProps, UIElementStatus } from '../../../types';
import { VpaInputHandlers } from '../VpaInput/VpaInput';
import VpaInput from '../VpaInput';
import SegmentedControl from '../../../internal/SegmentedControl';
import getImage from '../../../../utils/get-image';
import { UpiMode } from '../../types';
import './UPIComponent.scss';

interface UPIComponentProps {
    defaultMode: UpiMode;
    showPayButton: boolean;
    ref(ref: RefObject<typeof UPIComponent>): void;
    payButton(props: PayButtonFunctionProps): h.JSX.Element;
    onChange({ data: VpaInputDataState, valid, errors, isValid: boolean }): void;
    onUpdateMode(mode: UpiMode): void;
}

const A11Y = {
    ButtonId: {
        VPA: `upi-button-${UpiMode.Vpa}`,
        QR: `upi-button-${UpiMode.QrCode}`
    },
    AreaId: {
        VPA: `upi-area-${UpiMode.Vpa}`,
        QR: `upi-area-${UpiMode.QrCode}`
    }
};

export default function UPIComponent({ defaultMode, onChange, onUpdateMode, payButton, showPayButton }: UPIComponentProps): h.JSX.Element {
    const { i18n, loadingContext } = useCoreContext();
    const inputRef = useRef<VpaInputHandlers>(null);
    const [status, setStatus] = useState<UIElementStatus>('ready');
    const [mode, setMode] = useState<UpiMode>(defaultMode);
    const isMobile = window.matchMedia('(max-width: 768px)').matches && /Android|iPhone|iPod/.test(navigator.userAgent);

    this.setStatus = (status: UIElementStatus) => {
        setStatus(status);
    };

    this.showValidation = () => {
        inputRef.current.validateInput();
    };

    const onChangeUpiMode = useCallback(
        (newMode: UpiMode) => {
            setMode(newMode);
            onUpdateMode(newMode);
        },
        [onUpdateMode]
    );

    return (
        <Fragment>
            <p className="adyen-checkout_upi-mode-selection-text">{i18n.get('upi.modeSelection')}</p>

            <SegmentedControl
                onChange={onChangeUpiMode}
                selectedValue={mode}
                disabled={status === 'loading'}
                classNameModifiers={['upi-margin-bottom']}
                options={[
                    {
                        label: isMobile ? 'VPA' : 'Virtual Payment Address',
                        value: UpiMode.Vpa,
                        htmlProps: { id: A11Y.ButtonId.VPA, 'aria-expanded': mode === UpiMode.Vpa, 'aria-controls': A11Y.AreaId.VPA }
                    },
                    {
                        label: 'QR Code',
                        value: UpiMode.QrCode,
                        htmlProps: {
                            id: A11Y.ButtonId.QR,
                            'aria-expanded': mode === UpiMode.QrCode,
                            'aria-controls': A11Y.AreaId.QR
                        }
                    }
                ]}
            />

            {mode === UpiMode.Vpa ? (
                <div id={A11Y.AreaId.VPA} aria-labelledby={A11Y.ButtonId.VPA} role="region">
                    <VpaInput disabled={status === 'loading'} ref={inputRef} onChange={onChange} />

                    {showPayButton &&
                        payButton({
                            label: i18n.get('continue'),
                            status
                        })}
                </div>
            ) : (
                <div id={A11Y.AreaId.QR} aria-labelledby={A11Y.ButtonId.QR} role="region">
                    {showPayButton &&
                        payButton({
                            label: i18n.get('generateQRCode'),
                            icon: getImage({ loadingContext: loadingContext, imageFolder: 'components/' })('qr'),
                            status
                        })}
                </div>
            )}
        </Fragment>
    );
}
