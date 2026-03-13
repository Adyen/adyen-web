import { Fragment, h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import DonationComponent from './components/DonationComponent';
import { TxVariants } from '../tx-variants';
import type { ICore } from '../../core/types';
import type { DonationConfiguration } from './types';
import { AnalyticsLogEvent, LogEventSubtype, LogEventType } from '../../core/Analytics/events/AnalyticsLogEvent';

class DonationElement extends UIElement<DonationConfiguration> {
    public static readonly type = TxVariants.donation;

    constructor(checkout: ICore, props?: DonationConfiguration) {
        super(checkout, props);
        this.donate = this.donate.bind(this);
        this.cancel = this.cancel.bind(this);
    }

    public static readonly defaultProps = {
        onCancel: () => {},
        onDonate: () => {}
    };

    /**
     * Returns the component payment data ready to submit to the Checkout API
     */
    get data() {
        return this.state.data;
    }

    /**
     * Returns whether the component state is valid or not
     */
    get isValid() {
        return this.state.isValid;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
    }

    donate() {
        // Send analytics
        const event = new AnalyticsLogEvent({
            component: DonationElement.type,
            type: LogEventType.submit,
            subType: LogEventSubtype.donation,
            message: 'Making donation'
        });
        this.core.modules.analytics.sendAnalytics(event);

        const { data, isValid } = this;
        this.props.onDonate({ data, isValid }, this);
    }

    cancel() {
        // Send analytics
        const event = new AnalyticsLogEvent({
            component: DonationElement.type,
            type: LogEventType.closed,
            subType: LogEventSubtype.donation,
            message: 'Opting to not make donation'
        });
        this.core.modules.analytics.sendAnalytics(event);

        const { data, isValid } = this;
        this.props.onCancel({ data, isValid });
    }

    public handleRef = ref => {
        this.componentRef = ref;
    };

    protected override componentToRender(): h.JSX.Element {
        return (
            <Fragment>
                {/*@ts-ignore ref*/}
                <DonationComponent {...this.props} ref={this.handleRef} onChange={this.setState} onDonate={this.donate} onCancel={this.cancel} />
            </Fragment>
        );
    }
}

export default DonationElement;
