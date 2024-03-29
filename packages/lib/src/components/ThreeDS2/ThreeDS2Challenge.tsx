import { h } from 'preact';
import UIElement from '../UIElement';
import PrepareChallenge from './components/Challenge';
import { ErrorCodeObject } from './components/utils';
import { DEFAULT_CHALLENGE_WINDOW_SIZE, THREEDS2_CHALLENGE, THREEDS2_CHALLENGE_ERROR, THREEDS2_ERROR } from './config';
import { existy } from '../internal/SecuredFields/lib/utilities/commonUtils';
import { hasOwnProperty } from '../../utils/hasOwnProperty';
import Language from '../../language';
import { ActionHandledReturnObject, AnalyticsModule } from '../types';
import { ANALYTICS_API_ERROR, ANALYTICS_ERROR_CODE_ACTION_IS_MISSING_PAYMENT_DATA, ANALYTICS_RENDERED_STR } from '../../core/Analytics/constants';
import { SendAnalyticsObject } from '../../core/Analytics/types';

export interface ThreeDS2ChallengeProps {
    token?: string;
    dataKey?: string;
    notificationURL?: string;
    onError?: (error: string | ErrorCodeObject) => void;
    paymentData?: string;
    size?: string;
    challengeWindowSize?: '01' | '02' | '03' | '04' | '05';
    type?: string;
    loadingContext?: string;
    useOriginalFlow?: boolean;
    i18n?: Language;
    onActionHandled: (rtnObj: ActionHandledReturnObject) => void;
    modules?: { analytics: AnalyticsModule };
}

class ThreeDS2Challenge extends UIElement<ThreeDS2ChallengeProps> {
    public static type = 'threeDS2Challenge';

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
        if (state) super.onComplete(state);
        this.unmount(); // re. fixing issue around back to back challenge calls
    }

    render() {
        // existy used because threeds2InMDFlow will send empty string for paymentData and we should be allowed to proceed with this
        if (!existy(this.props.paymentData)) {
            /**
             *  One component is used for both old and new 3DS2 challenge flows
             *   - The presence of useOriginalFlow indicates the old flow which used paymentData from the 3DS2 action
             *   - The new flow uses authorisationToken from the 3DS2 action, passed internally in a prop called paymentData
             */
            const dataTypeForError = hasOwnProperty(this.props, 'useOriginalFlow') ? 'paymentData' : 'authorisationToken';

            this.props.onError({ errorCode: 'threeds2.challenge', message: `No ${dataTypeForError} received. Challenge cannot proceed` });

            this.submitAnalytics({
                type: THREEDS2_ERROR,
                code: ANALYTICS_ERROR_CODE_ACTION_IS_MISSING_PAYMENT_DATA,
                errorType: ANALYTICS_API_ERROR,
                message: `${THREEDS2_CHALLENGE_ERROR}: Missing 'paymentData' property from threeDS2 action`
            });

            return null;
        }

        return <PrepareChallenge {...this.props} onComplete={this.onComplete} onSubmitAnalytics={this.submitAnalytics} />;
    }
}

export default ThreeDS2Challenge;
