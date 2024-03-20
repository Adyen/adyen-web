import { h } from 'preact';
import { KlarnaWidget } from '../KlarnaWidget/KlarnaWidget';
import { useState } from 'preact/hooks';
import { Status } from '../../../internal/BaseElement/types';

export function KlarnaContainer(props) {
    const [action, setAction] = useState({
        sdkData: props.sdkData,
        paymentMethodType: props.paymentMethodType,
        paymentData: props.paymentData
    });
    const [status, setStatus] = useState(Status.Ready);

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
            disabled: status === Status.Loading,
            classNameModifiers: ['standalone'],
            label: `${this.props.i18n.get('continueTo')} ${props.displayName}`
        });
    }

    return null;
}
