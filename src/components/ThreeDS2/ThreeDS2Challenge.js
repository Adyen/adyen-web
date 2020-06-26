import { h } from 'preact';
import UIElement from '../UIElement';
import ThreeDS2Challenge from './components/Challenge';

/**
 * ThreeDS2ChallengeElement
 */
class ThreeDS2ChallengeElement extends UIElement {
    static type = 'threeDS2Challenge';

    static defaultProps = {
        dataKey: 'threeds2.challengeResult',
        challengeContainer: null,
        size: '01',
        notificationURL: null,
        challengeToken: null,
        type: 'ChallengeShopper',
        onComplete: () => {}
    };

    render() {
        return <ThreeDS2Challenge {...this.props} onComplete={this.onComplete} />;
    }
}

export default ThreeDS2ChallengeElement;
