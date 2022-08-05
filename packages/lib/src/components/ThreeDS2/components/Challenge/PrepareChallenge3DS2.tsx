import { Component, h } from 'preact';
import DoChallenge3DS2 from './DoChallenge3DS2';
import { createChallengeResolveData, handleErrorCode, prepareChallengeData, createOldChallengeResolveData } from '../utils';
import { PrepareChallenge3DS2Props, PrepareChallenge3DS2State } from './types';
import { ThreeDS2FlowObject } from '../../types';
import '../../ThreeDS2.scss';
import Img from '../../../internal/Img';
import { getImageUrl } from '../../../../utils/get-image';
import './challenge.scss';
import { hasOwnProperty } from '../../../../utils/hasOwnProperty';

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
             * Create the data in the way that the /details endpoint expects.
             *  This is different for the 'old',v66, flow triggered by a 'threeDS2Challenge' action (which includes the threeds2InMDFlow)
             *  than for the new, v67, 'threeDS2' action
             */
            const resolveDataFunction = this.props.useOriginalFlow ? createOldChallengeResolveData : createChallengeResolveData;
            const data = resolveDataFunction(this.props.dataKey, resultObj.transStatus, this.props.paymentData);
            this.props.onComplete(data); // (equals onAdditionalDetails)
        });
    }

    setStatusError(errorObj) {
        this.setState({ status: 'error' }, () => {
            this.props.onError(errorObj);
        });
    }

    render(props, { challengeData }) {
        if (this.state.status === 'retrievingChallengeToken') {
            return (
                <DoChallenge3DS2
                    onCompleteChallenge={(challenge: ThreeDS2FlowObject) => {
                        // Challenge has resulted in an error (no transStatus could be retrieved) - but we still treat this as a valid scenario
                        if (hasOwnProperty(challenge.result, 'errorCode') && challenge.result.errorCode.length) {
                            // Tell the merchant there's been an error
                            const errorObject = handleErrorCode(challenge.result.errorCode, challenge.result.errorDescription);
                            this.props.onError(errorObject);
                            // Proceed with call to onAdditionalDetails
                            this.setStatusComplete(challenge.result);
                            return;
                        }

                        // A valid result (w. transStatus)
                        this.setStatusComplete(challenge.result);
                    }}
                    onErrorChallenge={(challenge: ThreeDS2FlowObject) => {
                        // Called when challenge times-out (which is still a valid scenario)
                        if (hasOwnProperty(challenge, 'errorCode')) {
                            const errorObject = handleErrorCode(challenge.errorCode);
                            this.props.onError(errorObject);
                            this.setStatusComplete(challenge.result);
                            return;
                        }

                        // or, when the challenge response is un-parseable JSON - in which case something unknown has gone wrong
                        this.setStatusError(challenge);
                    }}
                    {...challengeData}
                />
            );
        }

        if (this.state.status === 'error') {
            return (
                <div className="adyen-checkout__threeds2-challenge-error">
                    <Img
                        className="adyen-checkout__status__icon adyen-checkout__status__icon--error"
                        src={getImageUrl({ loadingContext: this.props.loadingContext, imageFolder: 'components/' })('error')}
                        alt={''}
                    />
                    <div className="adyen-checkout__status__text">{this.props.i18n.get('error.message.unknown')}</div>
                </div>
            );
        }

        return null;
    }
}

export default PrepareChallenge3DS2;
