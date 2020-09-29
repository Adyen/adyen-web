import { h } from 'preact';
import UIElement from '../UIElement';
import Challenge from './components/Challenge';
import { ErrorObject } from './components/utils';

export interface ThreeDS2ChallengeElementProps {
    challengeToken?: string;
    dataKey?: string;
    notificationURL?: string;
    onError?: (error: string | ErrorObject) => void;
    paymentData?: string;
    size?: string;
    type?: string;
}

class ThreeDS2ChallengeElement extends UIElement<ThreeDS2ChallengeElementProps> {
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

export default ThreeDS2ChallengeElement;
