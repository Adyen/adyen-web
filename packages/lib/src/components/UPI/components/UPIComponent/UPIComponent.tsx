import { Fragment, h, RefObject } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { PayButtonFunctionProps, UIElementStatus } from '../../../types';
import VpaInput, { VpaInputHandlers } from '../VpaInput/VpaInput';
import { App, UpiMode } from '../../types';
import useImage from '../../../../core/Context/useImage';
import useUpiSegmentedControlOptions from './useUpiSegmentedControlOptions';
import { A11Y } from './constants';
import './UPIComponent.scss';
import SegmentedControl from '../../../internal/SegmentedControl';
import ContentSeparator from '../../../internal/ContentSeparator';
import UPIIntentAppList from '../UPIIntentAppList';
import { useCoreContext } from '../../../../core/Context/CoreProvider';

type UpiData = { app?: App; virtualPaymentAddress?: string };

type OnChangeProps = { data: UpiData; valid; errors; isValid: boolean };

interface UPIComponentProps {
    defaultMode: UpiMode;
    showPayButton: boolean;
    apps?: Array<App>;

    ref?(ref: RefObject<typeof UPIComponent>): void;

    payButton?(props: PayButtonFunctionProps): h.JSX.Element;

    onChange({ data, valid, errors, isValid }: OnChangeProps): void;

    onUpdateMode?(mode: UpiMode): void;
}

export default function UPIComponent({ defaultMode, onChange, onUpdateMode, payButton, showPayButton, apps = [] }: UPIComponentProps): h.JSX.Element {
    const { i18n } = useCoreContext();
    const getImage = useImage();
    const [status, setStatus] = useState<UIElementStatus>('ready');
    const [isValid, setIsValid] = useState<boolean>(defaultMode === 'qrCode');
    const [mode, setMode] = useState<UpiMode>(defaultMode);
    const [vpa, setVpa] = useState<string>('');
    const [vpaInputHandlers, setVpaInputHandlers] = useState<VpaInputHandlers>(null);
    const [selectedApp, setSelectedApp] = useState<App>(null);
    const [valid, setValid] = useState(null);
    const [errors, setErrors] = useState(null);
    const segmentedControlOptions = useUpiSegmentedControlOptions(apps, mode);

    this.setStatus = (status: UIElementStatus) => {
        setStatus(status);
    };

    this.showValidation = () => {
        vpaInputHandlers?.validateInput();
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
        },
        [selectedApp]
    );

    const handleVpaInputChange = useCallback(({ data: { virtualPaymentAddress }, errors, valid, isValid }: OnChangeProps) => {
        setVpa(virtualPaymentAddress);
        setErrors(errors);
        setValid(valid);
        setIsValid(isValid);
    }, []);

    useEffect(() => {
        if (mode !== 'qrCode') {
            onChange({
                data: { ...(vpa && { virtualPaymentAddress: vpa }), ...(selectedApp && { app: selectedApp }) },
                errors,
                valid,
                isValid
            });
        } else {
            /**
             * When selecting QR code mode, we need to clear the state data and trigger the 'onChange'.
             */
            onChange({ data: {}, valid: {}, errors: {}, isValid: true });
        }
    }, [vpa, selectedApp, errors, valid, isValid, mode]);

    return (
        <Fragment>
            <p className="adyen-checkout_upi-mode-selection-text">{i18n.get('upi.modeSelection')}</p>
            <SegmentedControl
                onChange={onChangeUpiMode}
                selectedValue={mode}
                disabled={status === 'loading'}
                classNameModifiers={['upi-margin-bottom']}
                options={segmentedControlOptions}
            />
            <ContentSeparator label={i18n.get('upi.completePayment')} />
            {mode === 'intent' && (
                <div id={A11Y.AreaId.INTENT} aria-labelledby={A11Y.ButtonId.INTENT} className="adyen-checkout-upi-area-intent" role="region">
                    <UPIIntentAppList
                        disabled={status === 'loading'}
                        apps={apps}
                        selectedAppId={selectedApp?.id}
                        onAppSelect={handleAppSelect}
                        onVpaInputChange={handleVpaInputChange}
                        onSetInputHandlers={onSetVpaInputHandlers}
                    />

                    {showPayButton &&
                        payButton({
                            label: i18n.get('continue'),
                            status,
                            disabled: selectedApp == null
                        })}
                </div>
            )}
            {mode === 'vpa' && (
                <div id={A11Y.AreaId.VPA} aria-labelledby={A11Y.ButtonId.VPA} className="adyen-checkout-upi-area-vpa" role="region">
                    <VpaInput disabled={status === 'loading'} onChange={onChange} onSetInputHandlers={onSetVpaInputHandlers} />

                    {showPayButton &&
                        payButton({
                            label: i18n.get('continue'),
                            status
                        })}
                </div>
            )}
            {mode === 'qrCode' && (
                <div id={A11Y.AreaId.QR} aria-labelledby={A11Y.ButtonId.QR} className="adyen-checkout-upi-area-qr-code" role="region">
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
