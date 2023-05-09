import { Component, h } from 'preact';
import DoChallenge3DS2 from './DoChallenge3DS2';
import { createChallengeResolveData, handleErrorCode, prepareChallengeData, createOldChallengeResolveData } from '../utils';
import { PrepareChallenge3DS2Props, PrepareChallenge3DS2State } from './types';
import { ChallengeData, ThreeDS2FlowObject } from '../../types';
import '../../ThreeDS2.scss';
import Img from '../../../internal/Img';
import './challenge.scss';
import { hasOwnProperty } from '../../../../utils/hasOwnProperty';
import useImage from '../../../../core/Context/useImage';
import { ActionHandledReturnObject } from '../../../types';
import { ErrorObject } from '../../../../core/Errors/types';
import { THREEDS2_CHALLENGE_ERROR } from '../../config';

class PrepareChallenge3DS2 extends Component<PrepareChallenge3DS2Props, PrepareChallenge3DS2State> {
    public static defaultProps = {
        onComplete: () => {},
        onError: () => {},
        onActionHandled: () => {}
    };

    constructor(props) {
        super(props);

        if (this.props.token) {
            const challengeData: ChallengeData | ErrorObject = prepareChallengeData({
                token: this.props.token,
                size: this.props.challengeWindowSize || this.props.size
            });

            /**
             * Check the structure of the created challengeData
             */
            const { acsURL } = challengeData as ChallengeData;
            const { acsTransID, messageVersion, threeDSServerTransID } = (challengeData as ChallengeData).cReqData;

            /** Missing props */
            if (!acsURL || !acsTransID || !messageVersion || !threeDSServerTransID) {
                this.setStatusError({
                    errorInfo:
                        'Challenge Data missing one or more of the following properties (acsURL | acsTransID | messageVersion | threeDSServerTransID)',
                    errorObj: challengeData
                });
                return;
            }

            /** All good */
            this.state = {
                status: 'retrievingChallengeToken',
                challengeData: challengeData as ChallengeData,
                errorInfo: null
            };
        } else {
            this.setStatusError({
                errorInfo: 'Missing challengeToken parameter'
            });

            // TODO send error to analytics endpoint
            this.submitAnalytics(`${THREEDS2_CHALLENGE_ERROR}: Missing 'token' property from threeDS2 action`);
        }
    }

    public submitAnalytics = what => {
        this.props.onSubmitAnalytics(what);
    };

    public onActionHandled = (rtnObj: ActionHandledReturnObject) => {
        this.submitAnalytics(rtnObj.actionDescription);
        this.props.onActionHandled(rtnObj);
    };

    setStatusComplete(resultObj) {
        this.setState({ status: 'complete' }, () => {
            /**
             * Create the data in the way that the /details endpoint expects.
             *  This is different for the 'old',v66, flow triggered by a 'threeDS2Challenge' action (which includes the threeds2InMDFlow)
             *  than for the new, v67, 'threeDS2' action
             */
            const resolveDataFunction = this.props.useOriginalFlow ? createOldChallengeResolveData : createChallengeResolveData;
            const data = resolveDataFunction(this.props.dataKey, resultObj.transStatus, this.props.paymentData);

            this.props.onComplete(data); // (equals onAdditionalDetails - except for 3DS2InMDFlow)
        });
    }

    setStatusError(errorInfoObj) {
        this.setState({ status: 'error', errorInfo: errorInfoObj.errorInfo });
        this.props.onError(errorInfoObj); // For some reason this doesn't fire if it's in a callback passed to the setState function
    }

    // eslint-disable-next-line no-empty-pattern
    render({}, { challengeData }) {
        const getImage = useImage();
        if (this.state.status === 'retrievingChallengeToken') {
            return (
                <DoChallenge3DS2
                    onCompleteChallenge={(challenge: ThreeDS2FlowObject) => {
                        // Challenge has resulted in an error (no transStatus could be retrieved) - but we still treat this as a valid scenario
                        if (hasOwnProperty(challenge.result, 'errorCode') && challenge.result.errorCode.length) {
                            // Tell the merchant there's been an error
                            const errorCodeObject = handleErrorCode(challenge.result.errorCode, challenge.result.errorDescription);
                            this.props.onError(errorCodeObject);
                        }

                        // This is the response we were looking for
                        if (challenge.threeDSServerTransID === challengeData.cReqData.threeDSServerTransID) {
                            // Proceed with call to onAdditionalDetails
                            this.setStatusComplete(challenge.result);
                        } else {
                            /**
                             * We suspect there is a scenario where the cRes is empty the first time causing the shopper to try to pay again, from the same
                             * browser window. But due to a suboptimal implementation by the merchant - the first set of 3DS2 components has not been properly removed.
                             * This means that for the second, successful challenge, there are a double set of listeners, leading to double callbacks, leading to
                             * double /details calls (one that will fail, one that will succeed).
                             *
                             * So here we detect that this is not the response we are looking for, and this time round, unmount this set of 3DS2 comps
                             */
                            console.debug('### PrepareChallenge3DS2::threeDSServerTransID:: ids do not match');
                            this.props.onComplete(null); // Send null so parent will unmount without calling onComplete
                        }
                    }}
                    onErrorChallenge={(challenge: ThreeDS2FlowObject) => {
                        /**
                         * Called when challenge times-out (which is still a valid scenario)...
                         */
                        if (hasOwnProperty(challenge, 'errorCode')) {
                            const errorCodeObject = handleErrorCode(challenge.errorCode);
                            this.props.onError(errorCodeObject);
                            this.setStatusComplete(challenge.result);
                            return;
                        }
                    }}
                    {...challengeData}
                    onActionHandled={this.onActionHandled}
                    onSubmitAnalytics={this.submitAnalytics}
                />
            );
        }

        if (this.state.status === 'error') {
            return (
                <div className="adyen-checkout__threeds2-challenge-error">
                    <Img
                        className="adyen-checkout__status__icon adyen-checkout__status__icon--error"
                        src={getImage({
                            imageFolder: 'components/'
                        })('error')}
                        alt={''}
                    />
                    <div className="adyen-checkout__status__text">
                        {this.state.errorInfo ? this.state.errorInfo : this.props.i18n.get('error.message.unknown')}
                    </div>
                </div>
            );
        }

        return null;
    }
}

export default PrepareChallenge3DS2;
