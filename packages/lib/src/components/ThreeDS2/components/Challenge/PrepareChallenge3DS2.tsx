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
                status: 'retrievingChallengeToken',
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
        this.setState({ status: 'complete' }, () => {
            /**
             * Create the data in the way that the /details endpoint expects.
             *  This is different for the flow triggered by the threeds2InMDFlow process than for the new, v67, 'threeDS2' action
             */
            const resolveDataFunction = this.props.isMDFlow ? createOldChallengeResolveData : createChallengeResolveData;
            const data = resolveDataFunction(this.props.dataKey, resultObj.transStatus, this.props.paymentData);

            this.props.onComplete(data); // (equals onAdditionalDetails - except for 3DS2InMDFlow)
        });
    }

    setStatusError(errorInfoObj) {
        this.setState({ status: 'error', errorInfo: errorInfoObj.errorInfo });
        this.props.onError(errorInfoObj); // For some reason this doesn't fire if it's in a callback passed to the setState function
    }

    render({ onActionHandled }, { challengeData }) {
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

                        this.setStatusComplete(challenge.result);
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
