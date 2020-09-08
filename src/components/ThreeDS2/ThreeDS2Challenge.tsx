import { h } from 'preact';
import UIElement from '../UIElement';
import ThreeDS2Challenge from './components/Challenge';

interface ThreeDS2ChallengeElementProps {
    challengeToken?: string;
    dataKey?: string;
    notificationURL?: string;
    onError?: (error: object | string) => void;
    paymentData?: string;
    size?: string;
    type?: string;
}

class ThreeDS2ChallengeElement extends UIElement<ThreeDS2ChallengeElementProps> {
    public static type = 'threeDS2Challenge';

    public static defaultProps = {
        dataKey: 'threeds2.challengeResult',
        size: '01',
        type: 'ChallengeShopper',
        onComplete: () => {}
    };

    render() {
        return <ThreeDS2Challenge {...this.props} onComplete={this.onComplete} />;
    }
}

export default ThreeDS2ChallengeElement;
