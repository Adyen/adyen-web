import { h } from 'preact';
import UIElement from '../UIElement';
import Challenge from './components/Challenge';
import { ErrorObject } from './components/utils';
import { DEFAULT_CHALLENGE_WINDOW_SIZE } from './config';
import { existy } from '../internal/SecuredFields/lib/utilities/commonUtils';

export interface ThreeDS2ChallengeProps {
    token?: string;
    dataKey?: string;
    notificationURL?: string;
    onError?: (error: string | ErrorObject) => void;
    paymentData?: string;
    size?: string;
    challengeWindowSize?: '01' | '02' | '03' | '04' | '05';
    type?: string;
    useOriginalFlow?: boolean;
}

class ThreeDS2Challenge extends UIElement<ThreeDS2ChallengeProps> {
    public static type = 'threeDS2Challenge';

    public static defaultProps = {
        dataKey: 'threeDSResult',
        size: DEFAULT_CHALLENGE_WINDOW_SIZE,
        type: 'ChallengeShopper'
    };

    render() {
        // existy used because threeds2InMDFlow will send empty string for paymentData and we should be allowed to proceed with this
        if (!existy(this.props.paymentData)) {
            this.props.onError({ errorCode: 'threeds2.challenge', message: 'No paymentData received. Challenge cannot proceed' });
            return null;
        }

        return <Challenge {...this.props} onComplete={this.onComplete} />;
    }
}

export default ThreeDS2Challenge;
