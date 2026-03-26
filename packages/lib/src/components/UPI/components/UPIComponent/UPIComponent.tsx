import { Fragment, h, RefObject } from 'preact';
import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { UIElementStatus } from '../../../types';
import { App, UpiMode } from '../../types';
import useImage from '../../../../core/Context/useImage';
import { A11Y, MAX_PRIMARY_APPS, UPI_MODE } from '../../constants';
import './UPIComponent.scss';
import { SegmentedControlRegion } from '../../../internal/SegmentedControl';
import UPIIntentAppList from '../UPIIntentAppList';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import Alert from '../../../internal/Alert';
import UPIMandate, { Mandate } from '../UPIMandate/UPIMandate';
import { PayButtonProps } from '../../../internal/PayButton/PayButton';
import { useAmount } from '../../../../core/Context/AmountProvider';
import ContentSeparator from '../../../internal/ContentSeparator';
import Field from '../../../internal/FormFields/Field';
import Select from '../../../internal/FormFields/Select';
import { SelectTargetObject } from '../../../internal/FormFields/Select/types';
import { AnalyticsInfoEvent, InfoEventType, UiTarget } from '../../../../core/Analytics/events/AnalyticsInfoEvent';
import { AbstractAnalyticsEvent } from '../../../../core/Analytics/events/AbstractAnalyticsEvent';

type UpiData = { app?: App };

type OnChangeProps = { data: UpiData; valid?: { [key: string]: boolean }; errors?: { [key: string]: any }; isValid: boolean };

interface UPIComponentProps {
    mode: UpiMode;
    showPayButton: boolean;
    apps?: Array<App>;
    mandate?: Mandate;
    ref?(ref: RefObject<typeof UPIComponent>): void;
    payButton(props: PayButtonProps): h.JSX.Element;
    onChange({ data, valid, errors, isValid }: OnChangeProps): void;
    onSubmitAnalytics(event: AbstractAnalyticsEvent): void;
}

export default function UPIComponent({
    mode,
    onChange,
    payButton,
    showPayButton,
    mandate,
    apps = [],
    onSubmitAnalytics
}: Readonly<UPIComponentProps>): h.JSX.Element {
    const { i18n } = useCoreContext();
    const getImage = useImage();
    const [status, setStatus] = useState<UIElementStatus>('ready');
    const [selectedApp, setSelectedApp] = useState<App>(null);
    const { amount } = useAmount();
    const [isValid, setIsValid] = useState<boolean>(mode === UPI_MODE.QR_CODE);
    const mandateComponent = mandate && <UPIMandate mandate={mandate} amount={amount} />;

    const priorityApps = useMemo(() => apps.slice(0, MAX_PRIMARY_APPS), [apps]);
    const lowPriorityApps = useMemo(() => apps.slice(MAX_PRIMARY_APPS), [apps]);

    const lowPriorityAppItems = useMemo(() => lowPriorityApps.map(app => ({ id: app.id, name: app.name })), [lowPriorityApps]);

    this.setStatus = (status: UIElementStatus) => {
        setStatus(status);
    };

    this.showValidation = () => {
        if (mode === UPI_MODE.INTENT) {
            validateIntentApp();
        }
    };

    const handleAppSelect = useCallback(
        (app: App) => {
            if (app?.id === selectedApp?.id) return;

            setSelectedApp(app);
            setIsValid(true);
            setStatus('ready');

            onSubmitAnalytics(
                new AnalyticsInfoEvent({
                    component: 'upi_intent',
                    type: InfoEventType.selected,
                    target: UiTarget.list,
                    issuer: app.name
                })
            );
        },
        [selectedApp, onSubmitAnalytics]
    );

    const handleDropdownSelect = useCallback(
        (event: { target: SelectTargetObject }) => {
            const app = lowPriorityApps.find(a => a.id === event.target.value);
            if (!app || app.id === selectedApp?.id) return;

            setSelectedApp(app);
            setIsValid(true);
            setStatus('ready');

            onSubmitAnalytics(
                new AnalyticsInfoEvent({
                    component: 'upi_intent',
                    type: InfoEventType.selected,
                    target: UiTarget.listSearch,
                    issuer: app.name
                })
            );
        },
        [lowPriorityApps, selectedApp, onSubmitAnalytics]
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
        if (mode === UPI_MODE.QR_CODE) {
            /**
             * When selecting QR code mode, we need to clear the state data and trigger the 'onChange'.
             */
            onChange({ data: {}, valid: {}, errors: {}, isValid: true });
            return;
        }
        onChange({
            data: { ...(selectedApp && { app: selectedApp }) },
            isValid
        });
    }, [selectedApp, isValid, mode, onChange]);

    useEffect(() => {
        if (mode !== UPI_MODE.INTENT || priorityApps.length === 0) return;

        onSubmitAnalytics(
            new AnalyticsInfoEvent({
                component: 'upi_intent',
                type: InfoEventType.displayed,
                target: UiTarget.list,
                issuerList: priorityApps.map(a => a.id)
            })
        );
    }, []);

    return (
        <Fragment>
            {mode === UPI_MODE.INTENT && (
                <SegmentedControlRegion id={A11Y.AreaId.INTENT} ariaLabelledBy={A11Y.ButtonId.INTENT} className="adyen-checkout-upi-area-intent">
                    <span className="adyen-checkout-upi-instruction-label">{i18n.get('upi.intent.instruction')}</span>
                    <span className="adyen-checkout-upi-instruction-title">{i18n.get('upi.intent.apps.title')}</span>
                    {status === 'error' && <Alert icon={'cross'}>{i18n.get('upi.error.noAppSelected')}</Alert>}
                    <UPIIntentAppList
                        disabled={status === 'loading'}
                        apps={priorityApps}
                        selectedAppId={selectedApp?.id}
                        onAppSelect={handleAppSelect}
                    />
                    {lowPriorityApps.length > 0 && (
                        <Fragment>
                            <ContentSeparator classNames={['adyen-checkout-upi-instruction-separator']} label="issuerList.separatorText" />
                            <Field label={i18n.get('upi.intent.apps.dropdown.label')} classNameModifiers={['upi-app-list']} name={'upi-app-list'}>
                                <Select
                                    items={lowPriorityAppItems}
                                    selectedValue={lowPriorityApps.some(a => a.id === selectedApp?.id) ? selectedApp?.id : undefined}
                                    placeholder={i18n.get('upi.intent.apps.dropdown.placeholder')}
                                    name={'upi-app-list'}
                                    className={'adyen-checkout__upi-app-list__dropdown'}
                                    filterable={false}
                                    onChange={handleDropdownSelect}
                                />
                            </Field>
                        </Fragment>
                    )}
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
