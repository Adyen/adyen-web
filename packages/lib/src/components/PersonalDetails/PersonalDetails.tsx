import { Fragment, h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import PersonalDetails from '../internal/PersonalDetails';
import { TxVariants } from '../tx-variants';
import FormInstruction from '../internal/FormInstruction';
import { UIElementProps } from '../internal/UIElement/types';
import { AnalyticsInfoEvent, InfoEventType } from '../../core/Analytics/events/AnalyticsInfoEvent';

interface PersonalDetailsConfiguration extends UIElementProps {}

export class PersonalDetailsElement extends UIElement<PersonalDetailsConfiguration> {
    public static readonly type = TxVariants.personal_details;

    protected override beforeRender(configSetByMerchant?: PersonalDetailsConfiguration): void {
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

    protected override componentToRender(): h.JSX.Element {
        return (
            <Fragment>
                <FormInstruction />
                <PersonalDetails
                    setComponentRef={this.setComponentRef}
                    {...this.props}
                    onChange={this.setState}
                    {...(process.env.NODE_ENV !== 'production' && { payButton: this.payButton })}
                />
            </Fragment>
        );
    }
}

export default PersonalDetailsElement;
