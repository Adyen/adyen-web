import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { KlarnaWidget } from '../KlarnaWidget/KlarnaWidget';
import type { ComponentMethodsRef, PayButtonFunctionProps, UIElementStatus } from '../../../internal/UIElement/types';
import type { ActionHandledReturnObject } from '../../../../types/global-types';
import type { AdyenCheckoutError, KlarnaAction, KlarnaAdditionalDetailsData, KlarnaComponentRef } from '../../../../types';

interface KlarnaContainerProps {
    setComponentRef: (ref: ComponentMethodsRef) => void;
    displayName: string;
    showPayButton: boolean;
    type: string;
    onComplete(state: KlarnaAdditionalDetailsData): void;
    onError(error: AdyenCheckoutError): void;
    payButton(props?: PayButtonFunctionProps): h.JSX.Element;
    onLoaded(): void;
    onActionHandled(actionHandled: ActionHandledReturnObject): void;
}

export function KlarnaContainer({ setComponentRef, ...props }: KlarnaContainerProps) {
    const [widgetInitializationTime, setWidgetInitializationTime] = useState<number>(null);
    const [action, setAction] = useState<KlarnaAction>();
    const [status, setStatus] = useState('ready');
    const klarnaRef = useRef<KlarnaComponentRef>({
        setAction: (action: KlarnaAction) => {
            setAction(action);
            setWidgetInitializationTime(new Date().getTime());
        },
        setStatus: (status: UIElementStatus) => setStatus(status),
        reinitializeWidget: () => {
            setWidgetInitializationTime(new Date().getTime());
        }
    });

    useEffect(() => {
        setComponentRef(klarnaRef.current);
    }, [setComponentRef]);

    if (action?.sdkData) {
        return (
            <KlarnaWidget
                widgetInitializationTime={widgetInitializationTime}
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
            label: `${this.props.i18n.get('continueTo')} ${props.displayName}`
        });
    }

    return null;
}
