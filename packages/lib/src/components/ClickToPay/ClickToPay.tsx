import { h } from 'preact';
import UIElement from '../UIElement';
import CoreProvider from '../../core/Context/CoreProvider';
import ClickToPayProvider from '../Card/components/ClickToPay/context/ClickToPayProvider';
import ClickToPayComponent from '../Card/components/ClickToPay';
import { CheckoutPayload, IClickToPayService } from '../Card/services/types';
import { createClickToPayService } from '../Card/components/ClickToPay/utils';

export class ClickToPayElement extends UIElement {
    private readonly clickToPayService: IClickToPayService | null;

    constructor(props) {
        super(props);
        this.clickToPayService = createClickToPayService(props.clickToPayConfiguration, props.environment);
        this.clickToPayService?.initialize();
    }

    private handleSubmit = (payload: CheckoutPayload) => {
        console.log(payload);
    };

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <ClickToPayProvider clickToPayService={this.clickToPayService}>
                    <ClickToPayComponent onSubmit={this.handleSubmit} />
                </ClickToPayProvider>
            </CoreProvider>
        );
    }
}

export default ClickToPayElement;
