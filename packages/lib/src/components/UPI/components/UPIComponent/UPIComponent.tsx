import { Fragment, h } from 'preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { ComponentMethodsRef, UIElementStatus } from '../../../types';
import { App, UPIAppList, UpiMode } from '../../types';
import useImage from '../../../../core/Context/useImage';
import { A11Y, UPI_MODE } from '../../constants';
import { SegmentedControlRegion } from '../../../internal/SegmentedControl';
import UPIIntentAppList from '../UPIIntentAppList';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import Alert from '../../../internal/Alert';
import UPIMandate, { Mandate } from '../UPIMandate/UPIMandate';
import { PayButtonProps } from '../../../internal/PayButton/PayButton';
import { useAmount } from '../../../../core/Context/AmountProvider';
import { BrandIcon } from '../../../internal/BrandIcons/types';
import { BrandIcons } from '../../../internal/BrandIcons/BrandIcons';
import './UPIComponent.scss';
import { ValidationRuleResult } from '../../../../utils/Validator/ValidationRuleResult';

type UpiData = { app?: App };

type OnChangeProps = { data: UpiData; valid?: { [key: string]: boolean }; errors?: { [key: string]: ValidationRuleResult }; isValid: boolean };
interface UPIComponentProps {
    mode: UpiMode;
    showPayButton: boolean;
    appsList: UPIAppList;
    mandate?: Mandate;
    setComponentRef: (ref: ComponentMethodsRef) => void;
    payButton(props: PayButtonProps): h.JSX.Element;
    onChange({ data, valid, errors, isValid }: OnChangeProps): void;
}

export default function UPIComponent({
    mode,
    onChange,
    payButton,
    setComponentRef,
    showPayButton,
    mandate,
    appsList
}: Readonly<UPIComponentProps>): h.JSX.Element {
    const { i18n } = useCoreContext();
    const getImage = useImage();
    const [status, setStatus] = useState<UIElementStatus>('ready');
    const [selectedApp, setSelectedApp] = useState<App>(null);
    const { amount } = useAmount();
    const [isValid, setIsValid] = useState<boolean>(mode === UPI_MODE.QR_CODE);
    const mandateComponent = mandate && <UPIMandate mandate={mandate} amount={amount} />;

    const upiRef = useRef<ComponentMethodsRef>({
        setStatus: setStatus,
        showValidation: () => {
            if (mode === UPI_MODE.INTENT) {
                validateIntentApp();
            }
        }
    });

    useEffect(() => {
        setComponentRef(upiRef.current);
    }, [setComponentRef]);

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
        if (selectedApp) {
            setStatus('ready');
            setIsValid(true);
        } else {
            setStatus('error');
            setIsValid(false);
        }
    }, [selectedApp]);

    const brandIcons: BrandIcon[] = useMemo(
        () =>
            appsList.map(app => ({
                src: app.icon,
                alt: app.name
            })),
        [appsList]
    );

    useEffect(() => {
        if (mode === UPI_MODE.QR_CODE) {
            /**
             * When selecting QR code mode, we need to clear the state data and trigger 'onChange'.
             */
            onChange({ data: {}, valid: {}, errors: {}, isValid: true });
            return;
        }
        onChange({
            data: { ...(selectedApp && { app: selectedApp }) },
            isValid
        });
    }, [selectedApp, isValid, mode, onChange]);

    return (
        <Fragment>
            {mode === UPI_MODE.INTENT && (
                <SegmentedControlRegion id={A11Y.AreaId.INTENT} ariaLabelledBy={A11Y.ButtonId.INTENT} className="adyen-checkout-upi-area-intent">
                    <span className="adyen-checkout-upi-instruction-label">{i18n.get('upi.intent.instruction')}</span>
                    {status === 'error' && <Alert icon="cross">{i18n.get('upi.error.noAppSelected')}</Alert>}
                    <UPIIntentAppList
                        disabled={status === 'loading'}
                        appsList={appsList}
                        selectedAppId={selectedApp?.id}
                        onAppSelect={handleAppSelect}
                    />
                    {mandateComponent}
                    {showPayButton &&
                        payButton({
                            label: i18n.get('continue'),
                            status
                        })}
                </SegmentedControlRegion>
            )}
            {mode === UPI_MODE.QR_CODE && (
                <SegmentedControlRegion id={A11Y.AreaId.QR} ariaLabelledBy={A11Y.ButtonId.QR} className="adyen-checkout-upi-area-qr-code">
                    <span className="adyen-checkout-upi-instruction-label">{i18n.get('upi.qrCode.instruction')}</span>
                    <BrandIcons className="adyen-checkout-upi-brands" brandIcons={brandIcons} showIconOnError smallIcons containerType="grid" />
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
