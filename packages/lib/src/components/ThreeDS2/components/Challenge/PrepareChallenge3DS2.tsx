import { Component, h } from 'preact';
import DoChallenge3DS2 from './DoChallenge3DS2';
import { createChallengeResolveData, handleErrorCode, prepareChallengeData, createOldChallengeResolveData } from '../utils';
import { PrepareChallenge3DS2Props, PrepareChallenge3DS2State } from './types';
import { ThreeDS2FlowObject } from '../../types';
import '../../ThreeDS2.scss';

class PrepareChallenge3DS2 extends Component<PrepareChallenge3DS2Props, PrepareChallenge3DS2State> {
    public static defaultProps = {
        onComplete: () => {},
        onError: () => {}
    };

    constructor(props) {
        super(props);

        if (this.props.token) {
            const challengeData = prepareChallengeData({
                token: this.props.token,
                size: this.props.challengeWindowSize || this.props.size
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
            /**
             * As we transition to switching to the new 3DS2 Flow and we are in a "hybrid" mode of old /payments response working with
             * new /submitThreeDS2Fingerprint endpoint the challenge-only flow skips the /submitThreeDS2Fingerprint call - so the resolveData needs
             * to be prepared in the "old" way
             *
             * This situation will also apply to the threeds2InMDFlow TODO once fully switched to new flow - rename goesDirectToChallenge => threeds2InMDFlow
             */
            const resolveDataFunction = this.props.goesDirectToChallenge ? createOldChallengeResolveData : createChallengeResolveData;
            const data = resolveDataFunction(this.props.dataKey, resultObj.transStatus, this.props.paymentData);
            this.props.onComplete(data);
        });
    }

    render(props, { challengeData }) {
        if (this.state.status === 'retrievingChallengeToken') {
            return (
                <DoChallenge3DS2
                    onCompleteChallenge={(challenge: ThreeDS2FlowObject) => {
                        this.setStatusComplete(challenge.result);
                    }}
                    onErrorChallenge={(challenge: ThreeDS2FlowObject) => {
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

export default PrepareChallenge3DS2;
