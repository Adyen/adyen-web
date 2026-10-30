import { h } from 'preact';
import { PayButtonProps } from '../../internal/PayButton/PayButton';
import { IrisMode } from '../types';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { IRIS_ALLY_LABELS } from '../constants';
import { getIrisSegmentedControlOptions } from '../utils';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import { SegmentedControl, SegmentedControlRegion } from '../../internal/SegmentedControl';
import { ComponentMethodsRef, UIElementStatus } from '../../types';
import { IssuerItem } from '../../internal/IssuerList/types';
import IrisGenerateQRCode from './IrisGenerateQRCode';
import styles from './IrisComponent.module.scss';
import { AnalyticsInfoEvent, InfoEventType, UiTarget } from '../../../core/Analytics/events/AnalyticsInfoEvent';
import { TxVariants } from '../../tx-variants';
import useAnalytics from '../../../core/Analytics/useAnalytics';

interface IrisComponentProps {
    issuers: IssuerItem[];
    issuerListUI: h.JSX.Element;
    onUpdateMode: (mode: IrisMode) => void;
    payButton: (props: Partial<PayButtonProps>) => h.JSX.Element;
    setComponentRef: (ref: ComponentMethodsRef) => void;
}

export default function IrisComponent(props: Readonly<IrisComponentProps>) {
    const { i18n } = useCoreContext();
    const { analytics } = useAnalytics();

    const [mode, setMode] = useState<IrisMode>(IrisMode.QR_CODE);
    const [status, setStatus] = useState<UIElementStatus>('ready');
    const segmentedControlOptions = useMemo(() => getIrisSegmentedControlOptions(i18n), [i18n]);

    const issuersAvailable = props.issuers.length > 0;

    const handleModeChange = (mode: IrisMode) => {
        setMode(mode);
        props.onUpdateMode(mode);
        const event = new AnalyticsInfoEvent({
            type: InfoEventType.selected,
            target: UiTarget.segmentedControl,
            component: TxVariants.iris,
            selectedValue: mode
        });
        analytics.sendAnalytics(event);
    };

    const irisRef = useRef<ComponentMethodsRef>({
        setStatus: setStatus
    });

    useEffect(() => {
        props.setComponentRef(irisRef.current);
    }, [props.setComponentRef]);

    useEffect(() => {
        if (issuersAvailable) {
            const event = new AnalyticsInfoEvent({
                type: InfoEventType.displayed,
                target: UiTarget.segmentedControl,
                component: TxVariants.iris,
                selectedValue: IrisMode.QR_CODE
            });
            analytics.sendAnalytics(event);
        }
    }, []);

    if (!issuersAvailable) {
        return <IrisGenerateQRCode payButton={props.payButton} status={status} />;
    }

    return (
        <div>
            <SegmentedControl
                onChange={mode => handleModeChange(mode)}
                selectedValue={mode}
                disabled={status === 'loading'}
                options={segmentedControlOptions}
            />
            {mode === IrisMode.BANK_LIST && (
                <SegmentedControlRegion
                    id={IRIS_ALLY_LABELS.AreaId.BANK_LIST}
                    ariaLabelledBy={IRIS_ALLY_LABELS.ButtonId.BANK_LIST}
                    className={styles.bankList}
                >
                    {props.issuerListUI}
                </SegmentedControlRegion>
            )}
            {mode === IrisMode.QR_CODE && (
                <SegmentedControlRegion id={IRIS_ALLY_LABELS.AreaId.QR_CODE} ariaLabelledBy={IRIS_ALLY_LABELS.ButtonId.QR_CODE}>
                    <IrisGenerateQRCode payButton={props.payButton} status={status} />
                </SegmentedControlRegion>
            )}
        </div>
    );
}
