import { h } from 'preact';
import { KlarnaWidget } from '../KlarnaWidget/KlarnaWidget';
import { useState, useRef } from 'preact/hooks';
import { KlarnaAction, KlarnaContainerRef } from '../../types';

export function KlarnaContainer(props) {
    const [action, setAction] = useState<KlarnaAction>({
        sdkData: props.sdkData,
        paymentMethodType: props.paymentMethodType,
        paymentData: props.paymentData
    });
    const [status, setStatus] = useState('ready');

    const klarnaContainerRef = useRef<KlarnaContainerRef>({});
    // Just call once to create the object by which we expose the members expected by the parent comp
    if (!Object.keys(klarnaContainerRef.current).length) {
        props.setComponentRef(klarnaContainerRef.current);
    }

    klarnaContainerRef.current.setAction = setAction;
    klarnaContainerRef.current.setStatus = setStatus;
    klarnaContainerRef.current.props = props; // Needed for unit tests

    if (action.sdkData) {
        return (
            <KlarnaWidget
                containerRef={klarnaContainerRef.current}
                sdkData={action.sdkData}
                paymentMethodType={action.paymentMethodType}
                paymentData={action.paymentData}
                payButton={props.payButton}
                onComplete={props.onComplete}
                onError={props.onError}
                onLoaded={() => {
                    props.onActionHandled?.({ componentType: props.type, actionDescription: 'sdk-loaded', originalAction: action });
                    props.onLoaded();
                }}
            />
        );
    }

    if (props.showPayButton) {
        return props.payButton({
            ...props,
            status,
            disabled: status === 'loading',
            classNameModifiers: ['standalone'],
            label: `${props.i18n.get('continueTo')} ${props.displayName}`
        });
    }

    return null;
}
