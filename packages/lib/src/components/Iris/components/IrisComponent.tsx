import { h } from 'preact';
import { PayButtonProps } from '../../internal/PayButton/PayButton';
import { IrisMode } from '../types';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { getIrisSegmentedControlOptions, IRIS_ALLY_LABELS } from '../constants';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import { SegmentedControl } from '../../internal/SegmentedControl';
import { SegmentedControlRegion } from '../../internal/SegmentedControl/SegmentedControlRegion';
import { ComponentMethodsRef, UIElementStatus } from '../../types';
import isMobile from '../../../utils/isMobile';
import { IssuerItem } from '../../internal/IssuerList/types';
import IrisGenerateQRCode from './IrisGenerateQRCode';
import styles from './IrisComponent.module.scss';

interface IrisComponentProps {
    defaultMode: IrisMode;
    showPayButton?: boolean;
    issuers: IssuerItem[];
    issuerListUI: h.JSX.Element;
    onUpdateMode: (mode: IrisMode) => void;
    payButton: (props: Partial<PayButtonProps>) => h.JSX.Element;
    setComponentRef: (ref: ComponentMethodsRef) => void;
}

export default function IrisComponent(props: Readonly<IrisComponentProps>) {
    const { i18n } = useCoreContext();

    const [mode, setMode] = useState<IrisMode>(props.defaultMode);
    const [status, setStatus] = useState<UIElementStatus>('ready');
    const segmentedControlOptions = useMemo(() => {
        const options = getIrisSegmentedControlOptions(i18n);

        if (isMobile()) {
            return options.reverse();
        }

        return options;
    }, [i18n]);

    const handleModeChange = (mode: IrisMode) => {
        setMode(mode);
        props.onUpdateMode(mode);
    };

    const irisRef = useRef<ComponentMethodsRef>({
        setStatus: setStatus
    });

    useEffect(() => {
        props.setComponentRef(irisRef.current);
    }, [props.setComponentRef, irisRef.current]);

    useEffect(() => {
        if (props.issuers.length === 0) {
            handleModeChange(IrisMode.QR_CODE);
        }
    }, [props.issuers]);

    if (props.issuers.length === 0) {
        return <IrisGenerateQRCode showPayButton={props.showPayButton} payButton={props.payButton} status={status} />;
    }

    return (
        <div>
            <SegmentedControl onChange={handleModeChange} selectedValue={mode} disabled={status === 'loading'} options={segmentedControlOptions} />
            {mode === IrisMode.BANK_LIST && (
                <SegmentedControlRegion
                    id={IRIS_ALLY_LABELS.AreaId.BANK_LIST}
                    ariaLabelledBy={IRIS_ALLY_LABELS.ButtonId.BANK_LIST}
                    className={styles.issuerListContainer}
                >
                    {props.issuerListUI}
                </SegmentedControlRegion>
            )}
            {mode === IrisMode.QR_CODE && (
                <SegmentedControlRegion id={IRIS_ALLY_LABELS.AreaId.QR_CODE} ariaLabelledBy={IRIS_ALLY_LABELS.ButtonId.QR_CODE}>
                    <IrisGenerateQRCode showPayButton={props.showPayButton} payButton={props.payButton} status={status} />
                </SegmentedControlRegion>
            )}
        </div>
    );
}
