import { Fragment, h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import DonationComponent from './components/DonationComponent';
import { TxVariants } from '../tx-variants';
import type { ICore } from '../../core/types';
import type { DonationConfiguration, DonationProps, DonationServiceProps } from './types';
import { AnalyticsLogEvent, LogEventSubtype, LogEventType } from '../../core/Analytics/events/AnalyticsLogEvent';
import { DonationPayload } from './components/types';
import { AnalyticsInfoEvent, InfoEventType, UiTarget } from '../../core/Analytics/events/AnalyticsInfoEvent';
import DonationCampaignService from './DonationCampaignService';

class DonationElement extends UIElement<DonationConfiguration> {
    public static readonly type = TxVariants.donation;

    private _donationCampaignService: DonationCampaignService;

    constructor(checkout: ICore, props: DonationProps) {
        const isServiceMode = DonationElement.isServiceMode(props);
        const initialConfig = isServiceMode ? undefined : props;

        super(checkout, initialConfig);

        this.donate = this.donate.bind(this);
        this.cancel = this.cancel.bind(this);
        this.amountSelected = this.amountSelected.bind(this);

        if (checkout.session && isServiceMode) {
            console.log('### Donation::constructor:: SERVICE mode!');
            this._donationCampaignService = new DonationCampaignService(checkout, this, props.options);
        }
    }

    /**
     * Type guard to determine if props are for service mode.
     */
    private static isServiceMode(props: DonationProps): props is DonationServiceProps {
        return 'mode' in props && props.mode === 'service';
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

    // Setter for when DonationCampaignService has retrieved a Donation campaign
    setProps(newProps: DonationConfiguration) {
        this.props = { ...this.props, ...newProps };
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

        // Call callback
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

        // Call callback
        const { data, isValid } = this;
        this.props.onCancel({ data, isValid });
    }

    amountSelected(state: DonationPayload) {
        // Send analytics
        const event = new AnalyticsInfoEvent({
            component: DonationElement.type,
            type: InfoEventType.selected,
            selectedValue: JSON.stringify(state.data),
            target: UiTarget.donationAmountButton
        });
        this.core.modules.analytics.sendAnalytics(event);
    }

    public handleRef = ref => {
        this.componentRef = ref;
    };

    protected override componentToRender(): h.JSX.Element {
        return (
            <Fragment>
                <DonationComponent
                    {...this.props}
                    /*@ts-ignore ref*/
                    ref={this.handleRef}
                    onChange={this.setState}
                    onDonate={this.donate}
                    onCancel={this.cancel}
                    onAmountSelected={this.amountSelected}
                />
            </Fragment>
        );
    }
}

export default DonationElement;
