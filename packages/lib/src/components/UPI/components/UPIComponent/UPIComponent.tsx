import { Fragment, h, RefObject } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { PayButtonFunctionProps, UIElementStatus } from '../../../types';
import { VpaInputDataState, VpaInputHandlers } from '../VpaInput/VpaInput';
import VpaInput from '../VpaInput';
import SegmentedControl from '../../../internal/SegmentedControl';
import { ApiId, UpiMode } from '../../types';
import './UPIComponent.scss';
import isMobile from '../../../../utils/isMobile';
import useImage from '../../../../core/Context/useImage';
import UPIIntentAppList from '../UPIIntentAppList';

type OnChangeProps = { data: VpaInputDataState; valid; errors; isValid: boolean };

interface UPIComponentProps {
    defaultMode: UpiMode;
    showPayButton: boolean;
    // upi_intent
    appIds?: Array<ApiId>;

    ref(ref: RefObject<typeof UPIComponent>): void;

    payButton(props: PayButtonFunctionProps): h.JSX.Element;

    onChange({ data, valid, errors, isValid }: OnChangeProps): void;

    onUpdateMode(mode: UpiMode): void;
}

const A11Y = {
    ButtonId: {
        VPA: `upi-button-${UpiMode.Vpa}`,
        QR: `upi-button-${UpiMode.QrCode}`,
        INTENT: `upi-button-${UpiMode.Intent}`
    },
    AreaId: {
        VPA: `upi-area-${UpiMode.Vpa}`,
        QR: `upi-area-${UpiMode.QrCode}`,
        INTENT: `upi-area-${UpiMode.Intent}`
    }
};

const mockAppList = [
    {
        id: 'bhim',
        name: 'BHIM'
    },
    {
        id: 'gpay',
        name: 'Google Pay'
    },
    {
        id: 'PhonePe',
        name: 'phonepe'
    },
    {
        id: 'upi_intent',
        name: 'Other UPI'
    }
];

export default function UPIComponent({ defaultMode, onChange, onUpdateMode, payButton, showPayButton }: UPIComponentProps): h.JSX.Element {
    const { i18n } = useCoreContext();
    const getImage = useImage();
    const [vpaInputHandlers, setVpaInputHandlers] = useState<VpaInputHandlers>(null);
    const [status, setStatus] = useState<UIElementStatus>('ready');
    const [mode, setMode] = useState<UpiMode>(defaultMode);

    this.setStatus = (status: UIElementStatus) => {
        setStatus(status);
    };

    this.showValidation = () => {
        vpaInputHandlers.validateInput();
    };

    const onSetVpaInputHandlers = useCallback((handlers: VpaInputHandlers) => {
        setVpaInputHandlers(handlers);
    }, []);

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
                        label: isMobile() ? 'Intent' : 'Virtual Payment Address',
                        value: UpiMode.Intent, //todo test only
                        htmlProps: {
                            id: A11Y.ButtonId.VPA,
                            'aria-expanded': mode === UpiMode.Vpa,
                            'aria-controls': A11Y.AreaId.VPA
                        }
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
            {mode === UpiMode.Intent && (
                <div id={A11Y.AreaId.INTENT} aria-labelledby={A11Y.ButtonId.INTENT} role="region">
                    <UPIIntentAppList appIds={mockAppList} />

                    {showPayButton &&
                        payButton({
                            label: i18n.get('continue'),
                            status
                        })}
                </div>
            )}
            {mode === UpiMode.Vpa && (
                <div id={A11Y.AreaId.VPA} aria-labelledby={A11Y.ButtonId.VPA} role="region">
                    <VpaInput disabled={status === 'loading'} onChange={onChange} onSetInputHandlers={onSetVpaInputHandlers} />

                    {showPayButton &&
                        payButton({
                            label: i18n.get('continue'),
                            status
                        })}
                </div>
            )}
            {mode === UpiMode.QrCode && (
                <div id={A11Y.AreaId.QR} aria-labelledby={A11Y.ButtonId.QR} role="region">
                    {showPayButton &&
                        payButton({
                            label: i18n.get('generateQRCode'),
                            icon: getImage({ imageFolder: 'components/' })('qr'),
                            status
                        })}
                </div>
            )}
        </Fragment>
    );
}
