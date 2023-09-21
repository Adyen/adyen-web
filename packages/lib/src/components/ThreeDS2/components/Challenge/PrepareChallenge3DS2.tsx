import { Component, h } from 'preact';
import DoChallenge3DS2 from './DoChallenge3DS2';
import DelegatedAuthenticationEnrollment from '../DelegatedAuthentication/DelegatedAuthenticationEnrollment';
import { createChallengeResolveData, handleErrorCode, prepareChallengeData, createOldChallengeResolveData } from '../utils';
import { PrepareChallenge3DS2Props, PrepareChallenge3DS2State } from './types';
import { ChallengeData, ThreeDS2FlowObject } from '../../types';
import '../../ThreeDS2.scss';
import Img from '../../../internal/Img';
import './challenge.scss';
import { hasOwnProperty } from '../../../../utils/hasOwnProperty';
import useImage from '../../../../core/Context/useImage';

const enum ChallengeStatus {
    complete = 'complete',
    retrievingChallengeToken = 'retrievingChallengeToken',
    delegatedAuthenticationEnrollment = 'delegatedAuthenticationEnrollment',
    error = 'error'
}

class PrepareChallenge3DS2 extends Component<PrepareChallenge3DS2Props, PrepareChallenge3DS2State> {
    public static defaultProps = {
        onComplete: () => {},
        onError: () => {},
        onActionHandled: () => {}
    };

    constructor(props) {
        super(props);

        if (this.props.token) {
            const challengeData: ChallengeData = prepareChallengeData({
                token: this.props.token,
                size: this.props.challengeWindowSize || this.props.size
            });

            /**
             * Check the structure of the created challengeData
             */
            const { acsTransID, messageVersion, threeDSServerTransID } = challengeData.cReqData;

            /** Missing props */
            if (!challengeData.acsURL || !acsTransID || !messageVersion || !threeDSServerTransID) {
                this.setStatusError({
                    errorInfo:
                        'Challenge Data missing one or more of the following properties (acsURL | acsTransID | messageVersion | threeDSServerTransID)',
                    errorObj: challengeData
                });
                return;
            }

            /** All good */
            this.state = {
                status: ChallengeStatus.retrievingChallengeToken,
                challengeData,
                errorInfo: null
            };
        } else {
            this.setStatusError({
                errorInfo: 'Missing challengeToken parameter'
            });
        }
    }

    setStatusComplete(resultObj) {
        this.setState({ status: ChallengeStatus.complete }, () => {
            /**
             * Create the data in the way that the /details endpoint expects.
             *  This is different for the 'old',v66, flow triggered by a 'threeDS2Challenge' action (which includes the threeds2InMDFlow)
             *  than for the new, v67, 'threeDS2' action
             */

            if (this.state.challengeData.delegatedAuthenticationSDKInput && resultObj.transStatus === 'Y') {
                this.setState({ status: ChallengeStatus.delegatedAuthenticationEnrollment });
            } else {
                const resolveDataFunction = this.props.useOriginalFlow ? createOldChallengeResolveData : createChallengeResolveData;
                const data = resolveDataFunction(this.props.dataKey, resultObj.transStatus, this.props.paymentData);

                this.props.onComplete(data); // (equals onAdditionalDetails - except for 3DS2InMDFlow)
            }
        });
    }

    setStatusError(errorInfoObj) {
        this.setState({ status: ChallengeStatus.error, errorInfo: errorInfoObj.errorInfo });
        this.props.onError(errorInfoObj); // For some reason this doesn't fire if it's in a callback passed to the setState function
    }

    render({ onActionHandled }, { challengeData }) {
        const getImage = useImage();
        if (this.state.status === ChallengeStatus.retrievingChallengeToken) {
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
                    onActionHandled={onActionHandled}
                />
            );
        }

        if (this.state.status === ChallengeStatus.error) {
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

        if (this.state.status === ChallengeStatus.delegatedAuthenticationEnrollment) {
            return (
                <DelegatedAuthenticationEnrollment
                    dataKey={this.props.dataKey}
                    token={this.state.challengeData.delegatedAuthenticationSDKInput}
                    authorisationToken={this.props.paymentData}
                    onComplete={this.props.onComplete}
                    useOriginalFlow={this.props.useOriginalFlow}
                />
            );
        }

        return null;
    }
}

export default PrepareChallenge3DS2;
