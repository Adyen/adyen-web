import { Component, h } from 'preact';
import Do3DS2Challenge from './Do3DS2Challenge';
import { createResolveData, handleErrorCode, encodeResult, prepareChallengeData } from '../utils';
import { ThreeDS2ChallengeProps, ThreeDS2ChallengeState } from './types';
import { ChallengeObject } from '../../types';
import '../../ThreeDS2.scss';

class ThreeDS2Challenge extends Component<ThreeDS2ChallengeProps, ThreeDS2ChallengeState> {
    public static defaultProps = {
        onComplete: () => {},
        onError: () => {}
    };

    constructor(props) {
        super(props);

        if (this.props.challengeToken) {
            const challengeData = prepareChallengeData({
                challengeToken: this.props.challengeToken,
                size: this.props.size,
                notificationURL: this.props.notificationURL
            });

            this.state = {
                status: 'retrievingChallengeToken',
                challengeData
            };
        } else {
            this.state = { status: 'error' };
            this.props.onError('Missing challengeToken parameter');
        }
    }

    setStatusComplete(resultObj) {
        this.setState({ status: 'complete' }, () => {
            const paymentData = this.props.paymentData;
            const result = encodeResult(resultObj, this.props.type);
            const data = createResolveData(this.props.dataKey, result, paymentData);
            this.props.onComplete(data);
        });
    }

    render(props, { challengeData }) {
        if (this.state.status === 'retrievingChallengeToken') {
            return (
                <Do3DS2Challenge
                    onCompleteChallenge={(challenge: ChallengeObject) => {
                        this.setStatusComplete(challenge.result);
                    }}
                    onErrorChallenge={(challenge: ChallengeObject) => {
                        const errorObject = handleErrorCode(challenge.errorCode);
                        this.props.onError(errorObject);
                        this.setStatusComplete(challenge.result);
                    }}
                    {...challengeData}
                />
            );
        }

        return null;
    }
}

export default ThreeDS2Challenge;
