import { Fragment, h } from 'preact';
import { PayButtonProps } from '../../internal/PayButton/PayButton';
import { IrisMode } from '../types';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { getIrisSegmentedControlOptions } from '../constants';
import { useCoreContext } from '../../../core/Context/CoreProvider';
import { SegmentedControl } from '../../internal/SegmentedControl';
import { SegmentedControlRegion } from '../../internal/SegmentedControl/SegmentedControlRegion';
import useImage from '../../../core/Context/useImage';
import { ComponentMethodsRef, UIElementStatus } from '../../types';
import isMobile from '../../../utils/isMobile';

interface IrisComponentProps {
    defaultMode: IrisMode;
    onUpdateMode: (mode: IrisMode) => void;
    renderIssuerList: () => h.JSX.Element;
    showPayButton: boolean;
    payButton: (props: Partial<PayButtonProps>) => h.JSX.Element;
    setComponentRef: (ref: ComponentMethodsRef) => void;
}

export default function IrisComponent(props: Readonly<IrisComponentProps>) {
    const { i18n } = useCoreContext();
    const getImage = useImage();

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

    const selectedSegmentedControlOption = segmentedControlOptions.find(option => option.value === mode);

    return (
        <div>
            <SegmentedControl onChange={handleModeChange} selectedValue={mode} disabled={status === 'loading'} options={segmentedControlOptions} />
            <SegmentedControlRegion
                key={selectedSegmentedControlOption?.controls}
                id={selectedSegmentedControlOption?.controls}
                ariaLabelledBy={selectedSegmentedControlOption?.id}
            >
                {mode === IrisMode.BANK_LIST ? (
                    props.renderIssuerList()
                ) : (
                    <Fragment>
                        <p>{i18n.get('After generating the QR code you can use your preferred banking app to complete the payment.')}</p>
                        {props.showPayButton &&
                            props.payButton({
                                label: i18n.get('generateQRCode'),
                                icon: getImage({ imageFolder: 'components/' })('qr'),
                                status
                            })}
                    </Fragment>
                )}
            </SegmentedControlRegion>
        </div>
    );
}
