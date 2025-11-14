import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import Address from '../internal/Address';
import { CoreProvider } from '../../core/Context/CoreProvider';
import { TxVariants } from '../tx-variants';
import { AnalyticsInfoEvent, InfoEventType } from '../../core/Analytics/events/AnalyticsInfoEvent';
import { AddressProps } from '../internal/Address/types';
import { UIElementProps } from '../internal/UIElement/types';

export type AddressConfiguration = AddressProps & UIElementProps;

export class AddressElement extends UIElement<AddressConfiguration> {
    public static type = TxVariants.address;

    protected override beforeRender(configSetByMerchant?: AddressConfiguration): void {
        const event = new AnalyticsInfoEvent({
            type: InfoEventType.rendered,
            component: this.type,
            configData: configSetByMerchant
        });

        this.analytics.sendAnalytics(event);
    }

    get data() {
        return this.state.data;
    }

    get isValid() {
        return !!this.state.isValid;
    }

    render() {
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <Address
                    setComponentRef={this.setComponentRef}
                    {...this.props}
                    onChange={this.setState}
                    {...(process.env.NODE_ENV !== 'production' && { payButton: this.payButton })}
                />
            </CoreProvider>
        );
    }
}

export default AddressElement;
