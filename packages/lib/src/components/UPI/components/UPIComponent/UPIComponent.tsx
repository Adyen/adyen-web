import { Fragment, h, RefObject } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { PayButtonFunctionProps, UIElementStatus } from '../../../types';
import { App, UpiMode } from '../../types';
import useImage from '../../../../core/Context/useImage';
import { A11Y } from '../../constants';
import './UPIComponent.scss';
import { SegmentedControlRegion } from '../../../internal/SegmentedControl';
import UPIIntentAppList from '../UPIIntentAppList';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import Alert from '../../../internal/Alert';
import UPIMandate, { Mandate } from '../UPIMandate/UPIMandate';
import type { PaymentAmount } from '../../../../types/global-types';

type UpiData = { app?: App; virtualPaymentAddress?: string };

type OnChangeProps = { data: UpiData; valid?: { [key: string]: boolean }; errors?: { [key: string]: any }; isValid: boolean };

interface UPIComponentProps {
    defaultMode: UpiMode;
    showPayButton: boolean;
    apps?: Array<App>;
    mandate?: Mandate;
    amount?: PaymentAmount;

    ref?(ref: RefObject<typeof UPIComponent>): void;

    payButton?(props: PayButtonFunctionProps): h.JSX.Element;

    onChange({ data, valid, errors, isValid }: OnChangeProps): void;
}

export default function UPIComponent({
    defaultMode,
    onChange,
    payButton,
    showPayButton,
    mandate,
    amount,
    apps = []
}: Readonly<UPIComponentProps>): h.JSX.Element {
    const { i18n } = useCoreContext();
    const getImage = useImage();
    const [status, setStatus] = useState<UIElementStatus>('ready');
    const [selectedApp, setSelectedApp] = useState<App>(null);
    const [isValid, setIsValid] = useState<boolean>(defaultMode === 'qrCode');
    const mandateComponent = mandate && <UPIMandate mandate={mandate} amount={amount} />;

    this.setStatus = (status: UIElementStatus) => {
        setStatus(status);
    };

    this.showValidation = () => {
        if (defaultMode === 'intent') {
            validateIntentApp();
        }
    };

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
        if (defaultMode !== 'qrCode') {
            onChange({
                data: { ...(selectedApp && { app: selectedApp }) },
                isValid
            });
        } else {
            /**
             * When selecting QR code defaultMode, we need to clear the state data and trigger the 'onChange'.
             */
            onChange({ data: {}, valid: {}, errors: {}, isValid: true });
        }
    }, [selectedApp, isValid, defaultMode, onChange]);

    return (
        <Fragment>
            {defaultMode === 'intent' && (
                 <SegmentedControlRegion id={A11Y.AreaId.INTENT} ariaLabelledBy={A11Y.ButtonId.INTENT} className="adyen-checkout-upi-area-intent">
                    <span className="adyen-checkout-upi-instruction-label">{i18n.get('upi.intent.instruction')}</span>
                    {status === 'error' && <Alert icon={'cross'}>{i18n.get('upi.error.noAppSelected')}</Alert>}
                    <UPIIntentAppList disabled={status === 'loading'} apps={apps} selectedAppId={selectedApp?.id} onAppSelect={handleAppSelect} />
                    {mandateComponent}
                    {showPayButton &&
                        payButton({
                            label: i18n.get('continue'),
                            status
                        })}
                </SegmentedControlRegion>
            )}
            {defaultMode === 'qrCode' && (
                <SegmentedControlRegion id={A11Y.AreaId.QR} ariaLabelledBy={A11Y.ButtonId.QR} className="adyen-checkout-upi-area-qr-code">
                    <span className="adyen-checkout-upi-instruction-label">{i18n.get('upi.qrCode.instruction')}</span>
                    {mandateComponent}
                    {showPayButton &&
                        payButton({
                            label: i18n.get('generateQRCode'),
                            icon: getImage({ imageFolder: 'components/' })('qr'),
                            status
                        })}
                </SegmentedControlRegion>
            )}
        </Fragment>
    );
}
