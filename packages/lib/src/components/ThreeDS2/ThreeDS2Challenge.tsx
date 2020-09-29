import { h } from 'preact';
import UIElement from '../UIElement';
import Challenge from './components/Challenge';
import { ErrorObject } from './components/utils';

export interface ThreeDS2ChallengeProps {
    challengeToken?: string;
    dataKey?: string;
    notificationURL?: string;
    onError?: (error: string | ErrorObject) => void;
    paymentData?: string;
    size?: string;
    type?: string;
}

class ThreeDS2Challenge extends UIElement<ThreeDS2ChallengeProps> {
    public static type = 'threeDS2Challenge';

    public static defaultProps = {
        dataKey: 'threeds2.challengeResult',
        size: '01',
        type: 'ChallengeShopper'
    };

    render() {
        return <Challenge {...this.props} onComplete={this.onComplete} />;
    }
}

export default ThreeDS2Challenge;
