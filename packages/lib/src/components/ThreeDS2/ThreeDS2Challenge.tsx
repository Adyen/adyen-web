import { h } from 'preact';
import UIElement from '../UIElement';
import Challenge from './components/Challenge';
import { ErrorObject } from './components/utils';
import { DEFAULT_CHALLENGE_WINDOW_SIZE } from './config';

export interface ThreeDS2ChallengeProps {
    token?: string;
    dataKey?: string;
    notificationURL?: string;
    onError?: (error: string | ErrorObject) => void;
    paymentData?: string;
    size?: string;
    challengeWindowSize?: '01' | '02' | '03' | '04' | '05';
    type?: string;
}

class ThreeDS2Challenge extends UIElement<ThreeDS2ChallengeProps> {
    public static type = 'threeDS2Challenge';

    public static defaultProps = {
        dataKey: 'threeds2.challengeResult',
        size: DEFAULT_CHALLENGE_WINDOW_SIZE,
        type: 'ChallengeShopper'
    };

    render() {
        if (!this.props.paymentData) {
            this.props.onError({ errorCode: 'threeds2.challenge', message: 'No paymentData received. Challenge cannot proceed' });
            return null;
        }

        return <Challenge {...this.props} onComplete={this.onComplete} />;
    }
}

export default ThreeDS2Challenge;
