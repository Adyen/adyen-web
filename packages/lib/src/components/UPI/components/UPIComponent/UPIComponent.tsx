import { Fragment, h, RefObject } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { UIElementStatus } from '../../../types';
import VpaInput, { VpaInputHandlers } from '../VpaInput/VpaInput';
import { App, UpiMode } from '../../types';
import useImage from '../../../../core/Context/useImage';
import { A11Y } from '../../constants';
import './UPIComponent.scss';
import SegmentedControl from '../../../internal/SegmentedControl';
import UPIIntentAppList from '../UPIIntentAppList';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import Alert from '../../../internal/Alert';
import { SegmentedControlOption } from '../../../internal/SegmentedControl/SegmentedControl';
import UPIMandate, { Mandate } from '../UPIMandate/UPIMandate';
import { PayButtonProps } from '../../../internal/PayButton/PayButton';
import { useAmount } from '../../../../core/Context/AmountProvider';

type UpiData = { app?: App; virtualPaymentAddress?: string };

type OnChangeProps = { data: UpiData; valid?: { [key: string]: boolean }; errors?: { [key: string]: any }; isValid: boolean };

interface UPIComponentProps {
    defaultMode: UpiMode;
    showPayButton: boolean;
    apps?: Array<App>;
    segmentedControlOptions?: Array<SegmentedControlOption<UpiMode>>;
    mandate?: Mandate;
    ref?(ref: RefObject<typeof UPIComponent>): void;
    payButton(props: PayButtonProps): h.JSX.Element;
    onChange({ data, valid, errors, isValid }: OnChangeProps): void;
    onUpdateMode?(mode: UpiMode): void;
}

export default function UPIComponent({
    defaultMode,
    onChange,
    payButton,
    showPayButton,
    mandate,
    onUpdateMode = () => {},
    apps = [],
    segmentedControlOptions = []
}: Readonly<UPIComponentProps>): h.JSX.Element {
    const { i18n } = useCoreContext();
    const getImage = useImage();
    const [status, setStatus] = useState<UIElementStatus>('ready');
    const [mode, setMode] = useState<UpiMode>(defaultMode);
    const { amount } = useAmount();
    const [vpaInputHandlers, setVpaInputHandlers] = useState<VpaInputHandlers>(null);
    const [selectedApp, setSelectedApp] = useState<App>(null);
    const [isValid, setIsValid] = useState<boolean>(defaultMode === 'qrCode');
    const mandateComponent = mandate && <UPIMandate mandate={mandate} amount={amount} />;

    this.setStatus = (status: UIElementStatus) => {
        setStatus(status);
    };

    this.showValidation = () => {
        vpaInputHandlers?.validateInput();
        if (mode === 'intent') {
            validateIntentApp();
        }
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

    const handleAppSelect = useCallback(
        (app: App) => {
            if (app?.id === selectedApp?.id) return;

            setSelectedApp(app);
            setIsValid(true);
            setStatus('ready');
        },
        [selectedApp]
    );

    const validateIntentApp = useCallback(() => {
        if (!selectedApp) {
            setStatus('error');
            setIsValid(false);
        } else {
            setStatus('ready');
            setIsValid(true);
        }
    }, [selectedApp]);

    useEffect(() => {
        if (mode !== 'qrCode') {
            onChange({
                data: { ...(selectedApp && { app: selectedApp }) },
                isValid
            });
        } else {
            /**
             * When selecting QR code mode, we need to clear the state data and trigger the 'onChange'.
             */
            onChange({ data: {}, valid: {}, errors: {}, isValid: true });
        }
    }, [selectedApp, isValid, mode, onChange]);

    return (
        <Fragment>
            {segmentedControlOptions.length > 0 && <p className="adyen-checkout_upi-mode-selection-text">{i18n.get('upi.modeSelection')}</p>}
            <SegmentedControl
                onChange={onChangeUpiMode}
                selectedValue={mode}
                disabled={status === 'loading'}
                classNameModifiers={['upi-margin-bottom']}
                options={segmentedControlOptions}
            />

            {mode === 'intent' && (
                <div id={A11Y.AreaId.INTENT} aria-labelledby={A11Y.ButtonId.INTENT} className="adyen-checkout-upi-area-intent" role="region">
                    <span className="adyen-checkout-upi-instruction-label">{i18n.get('upi.intent.instruction')}</span>
                    {status === 'error' && <Alert icon={'cross'}>{i18n.get('upi.error.noAppSelected')}</Alert>}
                    <UPIIntentAppList disabled={status === 'loading'} apps={apps} selectedAppId={selectedApp?.id} onAppSelect={handleAppSelect} />
                    {mandateComponent}
                    {showPayButton &&
                        payButton({
                            label: i18n.get('continue'),
                            status
                        })}
                </div>
            )}
            {mode === 'vpa' && (
                <div id={A11Y.AreaId.VPA} aria-labelledby={A11Y.ButtonId.VPA} className="adyen-checkout-upi-area-vpa" role="region">
                    <span className="adyen-checkout-upi-instruction-label">{i18n.get('upi.collect.instruction')}</span>
                    <VpaInput disabled={status === 'loading'} onChange={onChange} onSetInputHandlers={onSetVpaInputHandlers} />
                    {mandateComponent}
                    {showPayButton &&
                        payButton({
                            label: i18n.get('continue'),
                            status
                        })}
                </div>
            )}
            {mode === 'qrCode' && (
                <div id={A11Y.AreaId.QR} aria-labelledby={A11Y.ButtonId.QR} className="adyen-checkout-upi-area-qr-code" role="region">
                    <span className="adyen-checkout-upi-instruction-label">{i18n.get('upi.qrCode.instruction')}</span>
                    {mandateComponent}
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
