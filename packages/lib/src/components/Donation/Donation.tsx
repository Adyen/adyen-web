import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import DonationComponent from './components/DonationComponent';
import { TxVariants } from '../tx-variants';
import type { ICore } from '../../core/types';
import { DonationCampaignOptions, DonationConfiguration, DonationProps } from './types';
import { AnalyticsLogEvent, LogEventSubtype, LogEventType } from '../../core/Analytics/events/AnalyticsLogEvent';
import { DonationPayload } from './components/types';
import { AnalyticsInfoEvent, InfoEventType, UiTarget } from '../../core/Analytics/events/AnalyticsInfoEvent';
import DonationCampaignService, { REPARENT_WITHOUT_AUTO_START_ERROR_MSG } from './DonationCampaignService';

class DonationElement extends UIElement<DonationConfiguration> {
    public static readonly type = TxVariants.donation;

    private readonly isInServiceMode: boolean = false;

    constructor(checkout: ICore, props: DonationProps) {
        const isServiceMode = DonationElement.isServiceMode(props);
        const initialConfig = isServiceMode ? undefined : props;

        super(checkout, initialConfig);

        this.donate = this.donate.bind(this);
        this.cancel = this.cancel.bind(this);
        this.amountSelected = this.amountSelected.bind(this);

        this.isInServiceMode = isServiceMode;

        if (checkout.session && isServiceMode) {
            void this.initialiseServiceMode(checkout, props); // NOSONAR - async in constructor is intentional for fire-and-forget service mode initialization
        }
    }

    /**
     * Type guard to determine if props are for "service" mode.
     *
     * The "service" mode is used in the /sessions flow:
     * - if the /payments response mandates it, we consult the /sessions/donationCampaigns endpoint on behalf of the merchant, and mount any found Donation Campaigns.
     *
     * The opposite of this mode is the "direct" mode, used in the Advanced flow:
     * - the merchant makes their own call to the /donationCampaigns endpoint and provides the Donation Campaign directly to the component.
     */
    private static isServiceMode(props: DonationProps): props is DonationCampaignOptions {
        return 'rootNode' in props && !!props.rootNode;
    }

    public static readonly defaultProps = {
        onCancel: () => {},
        onDonate: () => {}
    };

    private async initialiseServiceMode(checkout: ICore, props: DonationCampaignOptions) {
        console.log('### Donation::initialiseServiceMode:: checkout.session', checkout.session);

        if (checkout.session.sessionsDonationInitiated) {
            console.error(REPARENT_WITHOUT_AUTO_START_ERROR_MSG);
            return;
        }

        checkout.session.sessionsDonationInitiated = true;
        try {
            const donationCampaign = await new DonationCampaignService(checkout, props).initialise();
            if (donationCampaign) {
                this.props = { ...this.props, ...donationCampaign };
                this.mount(props.rootNode);
            }
            // If no campaigns found (response is null), don't mount - silently do nothing
        } catch (error: unknown) {
            // Call merchant defined callback
            // e.g. when the merchant wants to reparent the component and donation type = roundup but no commercialTxAmount has been set
            checkout.options.donation?.onDonationFailure?.(error);
        }
    }

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

        // If running in service mode, unmount the component
        if (this.isInServiceMode) {
            this.unmount();
        }

        this.props.onCancel({ data, isValid });
    }

    amountSelected(state: DonationPayload) {
        // Send analytics
        const event = new AnalyticsInfoEvent({
            component: DonationElement.type,
            type: InfoEventType.selected,
            selectedValue: JSON.stringify(state.data.amount),
            target: UiTarget.donationAmountButton
        });
        this.core.modules.analytics.sendAnalytics(event);
    }

    protected override componentToRender(): h.JSX.Element {
        return (
            <DonationComponent
                {...this.props}
                // @ts-ignore ref is internal from the Component
                ref={ref => {
                    this.componentRef = ref;
                }}
                onChange={this.setState}
                onDonate={this.donate}
                onCancel={this.cancel}
                onAmountSelected={this.amountSelected}
            />
        );
    }
}

export default DonationElement;
