import { Fragment, h, RefObject } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { type ComponentMethodsRef, PayButtonFunctionProps, UIElementStatus } from '../../../types';
import VpaInput, { VpaInputHandlers } from '../VpaInput/VpaInput';
import { App, UpiMode } from '../../types';
import useImage from '../../../../core/Context/useImage';
import useUpiSegmentedControlOptions from './useUpiSegmentedControlOptions';
import { A11Y } from './constants';
import './UPIComponent.scss';
import SegmentedControl from '../../../internal/SegmentedControl';
import UPIIntentAppList from '../UPIIntentAppList';
import { useCoreContext } from '../../../../core/Context/CoreProvider';

type UpiData = { app?: App; virtualPaymentAddress?: string };

type OnChangeProps = { data: UpiData; valid; errors; isValid: boolean };

interface UPIComponentProps {
    defaultMode: UpiMode;
    showPayButton: boolean;
    apps?: Array<App>;
    placeholders?: { virtualPaymentAddress?: string };
    showContextualElement?: boolean;
    setComponentRef(ref: ComponentMethodsRef): void;
    ref?(ref: RefObject<typeof UPIComponent>): void;
    payButton?(props: PayButtonFunctionProps): h.JSX.Element;
    onChange({ data, valid, errors, isValid }: OnChangeProps): void;
    onUpdateMode?(mode: UpiMode): void;
}

interface UpiComponentRef extends ComponentMethodsRef {
    showInvalidVpaError(): void;
}

export default function UPIComponent({
    defaultMode,
    onChange,
    onUpdateMode,
    payButton,
    showPayButton,
    showContextualElement = true,
    placeholders,
    apps = [],
    setComponentRef
}: UPIComponentProps): h.JSX.Element {
    const { i18n } = useCoreContext();
    const getImage = useImage();
    const [status, setStatus] = useState<UIElementStatus>('ready');
    const [isValid, setIsValid] = useState<boolean>(defaultMode === 'qrCode');
    const [mode, setMode] = useState<UpiMode>(defaultMode);
    const [vpa, setVpa] = useState<string>('');
    // const [vpaInputHandlers, setVpaInputHandlers] = useState<VpaInputHandlers>(null);
    const [selectedApp, setSelectedApp] = useState<App>(null);
    const [valid, setValid] = useState(null);
    const [errors, setErrors] = useState(null);
    const segmentedControlOptions = useUpiSegmentedControlOptions(apps, mode);

    const vpaInputHandlersRef = useRef<VpaInputHandlers>();

    const upiRef = useRef<UpiComponentRef>({
        setStatus: (status: UIElementStatus) => setStatus(status),
        showInvalidVpaError: () => vpaInputHandlersRef.current.showInvalidVpaError(),
        showValidation: () => vpaInputHandlersRef.current.validateInput()
    });

    useEffect(() => {
        setComponentRef(upiRef.current);
    }, [setComponentRef]);

    const onSetVpaInputHandlers = useCallback((handlers: VpaInputHandlers) => {
        vpaInputHandlersRef.current = handlers;
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
            {mode === 'intent' && (
                <div id={A11Y.AreaId.INTENT} aria-labelledby={A11Y.ButtonId.INTENT} className="adyen-checkout-upi-area-intent" role="region">
                    <UPIIntentAppList
                        disabled={status === 'loading'}
                        apps={apps}
                        selectedAppId={selectedApp?.id}
                        showContextualElement={showContextualElement}
                        vpaPlaceholder={placeholders?.virtualPaymentAddress}
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
                    <VpaInput
                        showContextualElement={showContextualElement}
                        placeholder={placeholders?.virtualPaymentAddress}
                        disabled={status === 'loading'}
                        onChange={onChange}
                        onSetInputHandlers={onSetVpaInputHandlers}
                    />

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
