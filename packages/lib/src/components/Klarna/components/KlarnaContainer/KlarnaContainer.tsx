import { h } from 'preact';
import { KlarnaWidget } from '../KlarnaWidget/KlarnaWidget';
import { useState } from 'preact/hooks';

export function KlarnaContainer(props) {
    const [action, setAction] = useState({
        sdkData: props.sdkData,
        paymentMethodType: props.paymentMethodType,
        paymentData: props.paymentData
    });
    const [status, setStatus] = useState('ready');

    this.setAction = setAction;
    this.setStatus = setStatus;

    if (action.sdkData) {
        return (
            <KlarnaWidget
                sdkData={action.sdkData}
                paymentMethodType={action.paymentMethodType}
                paymentData={action.paymentData}
                payButton={props.payButton}
                onComplete={props.onComplete}
                onError={props.onError}
                onLoaded={props.onLoaded}
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
