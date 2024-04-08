import { h } from 'preact';
import UIElement from '../internal/UIElement/UIElement';
import PrepareChallenge from './components/Challenge';
import { DEFAULT_CHALLENGE_WINDOW_SIZE, THREEDS2_CHALLENGE, THREEDS2_CHALLENGE_ERROR, THREEDS2_ERROR } from './config';
import { existy } from '../internal/SecuredFields/lib/utilities/commonUtils';
import { hasOwnProperty } from '../../utils/hasOwnProperty';
import { TxVariants } from '../tx-variants';
import { ThreeDS2ChallengeConfiguration } from './types';
import AdyenCheckoutError, { API_ERROR } from '../../core/Errors/AdyenCheckoutError';
import { ANALYTICS_API_ERROR, Analytics3DS2Errors, ANALYTICS_RENDERED_STR } from '../../core/Analytics/constants';
import { SendAnalyticsObject } from '../../core/Analytics/types';

class ThreeDS2Challenge extends UIElement<ThreeDS2ChallengeConfiguration> {
    public static type = TxVariants.threeDS2Challenge;

    public static defaultProps = {
        dataKey: 'threeDSResult',
        size: DEFAULT_CHALLENGE_WINDOW_SIZE,
        type: THREEDS2_CHALLENGE
    };

    protected submitAnalytics = (aObj: SendAnalyticsObject) => {
        if (aObj.type === ANALYTICS_RENDERED_STR) return; // suppress the rendered event (it will have the same timestamp as the "creq sent" event)

        super.submitAnalytics(aObj);
    };

    onComplete(state) {
        /**
         * Equals a call to onAdditionalDetails (as set in actionTypes.ts) for the regular, "native" flow.
         * However, if the action to create this component came from the 3DS2InMDFlow process it will instead equal a call to the onComplete callback
         * (as defined in the 3DS2InMDFlow and passed in as a config prop).
         */
        if (state) super.onComplete(state);
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

            this.submitAnalytics({
                type: THREEDS2_ERROR,
                code: Analytics3DS2Errors.ACTION_IS_MISSING_PAYMENT_DATA,
                errorType: ANALYTICS_API_ERROR,
                message: `${THREEDS2_CHALLENGE_ERROR}: Missing 'paymentData' property from threeDS2 action`
            });

            return null;
        }

        return (
            <PrepareChallenge
                {...this.props}
                onComplete={this.onComplete}
                onSubmitAnalytics={this.submitAnalytics}
                isMDFlow={this.props.paymentData.length < 15}
            />
        );
    }
}

export default ThreeDS2Challenge;
