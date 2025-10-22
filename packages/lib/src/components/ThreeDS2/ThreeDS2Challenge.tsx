import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import PrepareChallenge from './components/Challenge';
import { DEFAULT_CHALLENGE_WINDOW_SIZE, THREEDS2_CHALLENGE, THREEDS2_CHALLENGE_ERROR, THREEDS2_FULL } from './constants';
import { existy } from '../../utils/commonUtils';
import { hasOwnProperty } from '../../utils/hasOwnProperty';
import { TxVariants } from '../tx-variants';
import { ChallengeResolveData, LegacyChallengeResolveData, ThreeDS2ChallengeConfiguration } from './types';
import AdyenCheckoutError, { API_ERROR } from '../../core/Errors/AdyenCheckoutError';
import { ANALYTICS_ERROR_TYPE, Analytics3DS2Errors, ANALYTICS_RENDERED_STR, Analytics3DS2Events } from '../../core/Analytics/constants';
import { CoreProvider } from '../../core/Context/CoreProvider';
import { ActionHandledReturnObject } from '../../types/global-types';
import { AnalyticsLogEvent } from '../../core/Analytics/AnalyticsLogEvent';
import { AnalyticsEvent } from '../../core/Analytics/AnalyticsEvent';
import { AnalyticsInfoEvent } from '../../core/Analytics/AnalyticsInfoEvent';
import { AnalyticsErrorEvent } from '../../core/Analytics/AnalyticsErrorEvent';

class ThreeDS2Challenge extends UIElement<ThreeDS2ChallengeConfiguration> {
    public static type = TxVariants.threeDS2Challenge;

    public static defaultProps = {
        dataKey: 'threeDSResult',
        size: DEFAULT_CHALLENGE_WINDOW_SIZE,
        type: THREEDS2_CHALLENGE
    };

    protected submitAnalytics = (aObj: AnalyticsEvent) => {
        if (aObj instanceof AnalyticsInfoEvent && aObj.type === ANALYTICS_RENDERED_STR) return; // suppress the rendered event (it will have the same timestamp as the "creq sent" event)

        super.submitAnalytics(aObj);
    };

    protected onActionHandled = (rtnObj: ActionHandledReturnObject) => {
        const event = new AnalyticsLogEvent({
            type: THREEDS2_FULL,
            message: rtnObj.actionDescription,
            subType: Analytics3DS2Events.CHALLENGE_IFRAME_LOADED
        });

        this.submitAnalytics(event);

        super.onActionHandled(rtnObj);
    };

    onComplete(state: LegacyChallengeResolveData | ChallengeResolveData) {
        /**
         * Equals a call to onAdditionalDetails (as set in actionTypes.ts) for the regular, "native" flow.
         * However, if the action to create this component came from the 3DS2InMDFlow process it will instead equal a call to the onComplete callback
         * (as defined in the 3DS2InMDFlow and passed in as a config prop).
         */
        if (this.props.onComplete) {
            this.props.onComplete(state, this.elementRef);
        } else {
            super.onComplete(state);
        }

        this.unmount(); // re. fixing issue around back to back challenge calls
    }

    render() {
        // existy used because threeds2InMDFlow will send empty string for paymentData and we should be allowed to proceed with this
        if (!existy(this.props.paymentData)) {
            /**
             *   The presence of props.isMDFlow indicates the action to create this component came from the threeds2InMDFlow process which passes (an empty) paymentsData.
             *   The regular, "native" flow uses the authorisationToken from the 3DS2 action, which actionTypes.ts assigns to a property called paymentData
             */
            const dataTypeForError = hasOwnProperty(this.props, 'isMDFlow') ? 'paymentData' : 'authorisationToken';

            this.props.onError(new AdyenCheckoutError(API_ERROR, `No ${dataTypeForError} received. 3DS2 Challenge cannot proceed`));

            const event = new AnalyticsErrorEvent({
                code: Analytics3DS2Errors.ACTION_IS_MISSING_PAYMENT_DATA,
                errorType: ANALYTICS_ERROR_TYPE.apiError,
                message: `${THREEDS2_CHALLENGE_ERROR}: Missing 'paymentData' property from threeDS2 action`
            });

            this.submitAnalytics(event);

            return null;
        }

        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext} resources={this.resources}>
                <PrepareChallenge
                    {...this.props}
                    onComplete={this.onComplete}
                    onSubmitAnalytics={this.submitAnalytics}
                    isMDFlow={this.props.paymentData.length < 15}
                    onActionHandled={this.onActionHandled}
                />
            </CoreProvider>
        );
    }
}

export default ThreeDS2Challenge;
