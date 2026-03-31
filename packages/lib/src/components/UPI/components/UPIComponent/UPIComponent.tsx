import { Fragment, h } from 'preact';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { ComponentMethodsRef, UIElementStatus } from '../../../types';
import { App, UPIAppList, UpiMode } from '../../types';
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
import { BrandIcon } from '../../../internal/BrandIcons/types';
import { BrandIcons } from '../../../internal/BrandIcons/BrandIcons';
import { ValidationRuleResult } from '../../../../utils/Validator/ValidationRuleResult';
import './UPIComponent.scss';
import ContentSeparator from '../../../internal/ContentSeparator';
import Field from '../../../internal/FormFields/Field';
import Select from '../../../internal/FormFields/Select';
import { SelectTargetObject } from '../../../internal/FormFields/Select/types';
import { AnalyticsInfoEvent, InfoEventType, UiTarget } from '../../../../core/Analytics/events/AnalyticsInfoEvent';
import { AbstractAnalyticsEvent } from '../../../../core/Analytics/events/AbstractAnalyticsEvent';
import { ANALYTICS_SEARCH_DEBOUNCE_TIME } from '../../../../core/Analytics/constants';
import { debounce } from '../../../../utils/debounce';

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
    onSubmitAnalytics(event: AbstractAnalyticsEvent): void;
}

export default function UPIComponent({
    mode,
    onChange,
    payButton,
    setComponentRef,
    showPayButton,
    mandate,
    appsList,
    onSubmitAnalytics
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

    const priorityApps = useMemo(() => appsList.slice(0, MAX_PRIMARY_APPS), [appsList]);
    const lowPriorityApps = useMemo(() => appsList.slice(MAX_PRIMARY_APPS), [appsList]);

    this.setStatus = (status: UIElementStatus) => {
        setStatus(status);
    };

    useEffect(() => {
        setComponentRef(upiRef.current);
    }, [setComponentRef]);

    const selectApp = useCallback(
        (app: App, target: UiTarget) => {
            if (!app || app.id === selectedApp?.id) return;

            setSelectedApp(app);
            setIsValid(true);
            setStatus('ready');

            onSubmitAnalytics(
                new AnalyticsInfoEvent({
                    component: 'upi_intent',
                    type: InfoEventType.selected,
                    target,
                    issuer: app.name
                })
            );
        },
        [selectedApp, onSubmitAnalytics]
    );

    const handleAppSelect = useCallback((app: App) => selectApp(app, UiTarget.list), [selectApp]);

    const handleDropdownSelect = useCallback(
        (event: { target: SelectTargetObject }) => {
            const app = lowPriorityApps.find(a => a.id === event.target.value);
            selectApp(app, UiTarget.listDetected);
        },
        [lowPriorityApps, selectApp]
    );

    const handleListToggle = useCallback(
        (isOpen: boolean) => {
            if (isOpen) {
                onSubmitAnalytics(
                    new AnalyticsInfoEvent({
                        component: 'upi_intent',
                        type: InfoEventType.displayed,
                        target: UiTarget.list
                    })
                );
            }
        },
        [onSubmitAnalytics]
    );

    const debounceSearchAnalytics = useRef(debounce(onSubmitAnalytics, ANALYTICS_SEARCH_DEBOUNCE_TIME));

    const handleSearch = useCallback(() => {
        debounceSearchAnalytics.current({ type: InfoEventType.input, target: UiTarget.listDetected });
    }, []);

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
                        appsList={priorityApps}
                        selectedAppId={selectedApp?.id}
                        onAppSelect={handleAppSelect}
                    />
                    {lowPriorityApps.length > 0 && (
                        <Fragment>
                            <ContentSeparator classNames={['adyen-checkout-upi-instruction-separator']} label="issuerList.separatorText" />
                            <Field label={i18n.get('upi.intent.apps.dropdown.label')} classNameModifiers={['upi-app-list']} name={'upi-app-list'}>
                                <Select
                                    items={lowPriorityApps}
                                    selectedValue={lowPriorityApps.some(a => a.id === selectedApp?.id) ? selectedApp?.id : undefined}
                                    placeholder={i18n.get('upi.intent.apps.dropdown.placeholder')}
                                    name={'upi-app-list'}
                                    className={'adyen-checkout__upi-app-list__dropdown'}
                                    onChange={handleDropdownSelect}
                                    onInput={handleSearch}
                                    onListToggle={handleListToggle}
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
                    <BrandIcons
                        className="adyen-checkout-upi-brands"
                        brandIcons={brandIcons}
                        showIconOnError
                        smallIcons
                        remainingBrandsLabel={`+ ${i18n.get('paymentMethodBrand.other')}`}
                    />
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
