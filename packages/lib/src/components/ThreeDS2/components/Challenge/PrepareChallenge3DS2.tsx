import { Component, h } from 'preact';
import DoChallenge3DS2 from './DoChallenge3DS2';
import { createChallengeResolveData, prepareChallengeData, createOldChallengeResolveData, isErrorObject } from '../utils';
import { PrepareChallenge3DS2Props, PrepareChallenge3DS2State, StatusErrorInfoObject } from './types';
import { ChallengeData, ResultObject, ThreeDS2FlowObject, ErrorCodeObject } from '../../types';
import '../../ThreeDS2.scss';
import Img from '../../../internal/Img';
import './challenge.scss';
import { hasOwnProperty } from '../../../../utils/hasOwnProperty';
import useImage from '../../../../core/Context/useImage';
import AdyenCheckoutError, { ERROR } from '../../../../core/Errors/AdyenCheckoutError';
import { ActionHandledReturnObject } from '../../../../types/global-types';
import { SendAnalyticsObject } from '../../../../core/Analytics/types';
import {
    THREEDS2_CHALLENGE,
    THREEDS2_CHALLENGE_ERROR,
    THREEDS2_FULL,
    THREEDS2_NUM,
    MISSING_TOKEN_IN_ACTION_MSG,
    THREEDS2_ERROR
} from '../../constants';
import { isValidHttpUrl } from '../../../../utils/isValidURL';
import { ANALYTICS_API_ERROR, Analytics3DS2Errors } from '../../../../core/Analytics/constants';
import { ErrorObject } from '../../../../core/Errors/types';

class PrepareChallenge3DS2 extends Component<PrepareChallenge3DS2Props, PrepareChallenge3DS2State> {
    public static defaultProps = {
        onComplete: () => {},
        onError: () => {},
        onActionHandled: () => {},
        isMDFlow: false
    };

    constructor(props) {
        super(props);

        if (this.props.token) {
            const challengeData: ChallengeData | ErrorObject = prepareChallengeData({
                token: this.props.token,
                size: this.props.challengeWindowSize || this.props.size
            });

            this.state = {
                status: 'init',
                challengeData: challengeData as ChallengeData
            };
        } else {
            // Will be picked up in componentDidMount
            this.state = { challengeData: { success: false, error: MISSING_TOKEN_IN_ACTION_MSG } };

            console.debug(`${THREEDS2_CHALLENGE_ERROR}: ${MISSING_TOKEN_IN_ACTION_MSG}`);
        }
    }

    public onActionHandled = (rtnObj: ActionHandledReturnObject) => {
        this.props.onSubmitAnalytics({ type: THREEDS2_FULL, message: rtnObj.actionDescription });

        this.props.onActionHandled(rtnObj);
    };

    public onFormSubmit = (msg: string) => {
        this.props.onSubmitAnalytics({
            type: THREEDS2_FULL,
            message: msg
        });
    };

    componentDidMount() {
        const hasChallengeData = !isErrorObject(this.state.challengeData);

        if (hasChallengeData) {
            /**
             * Check the structure of the created challengeData
             */
            const { acsURL } = this.state.challengeData as ChallengeData;
            const hasValidAcsURL = isValidHttpUrl(
                acsURL,
                process.env.NODE_ENV === 'development' && process.env.__CLIENT_ENV__?.indexOf('localhost:8080') > -1 // allow http urls if in development and testing against localhost:8080);
            );

            // Only render component if we have an acsURL.
            if (!hasValidAcsURL) {
                // Set UI error & call onError callback
                this.setError(
                    {
                        errorInfo: `${Analytics3DS2Errors.TOKEN_IS_MISSING_ACSURL}: ${this.props.i18n.get('err.gen.9102')}` //
                    },
                    true
                );

                // Send error to analytics endpoint // TODO - check logs to see if this *ever* happens
                const errorCodeObject = {
                    type: THREEDS2_ERROR,
                    code: Analytics3DS2Errors.TOKEN_IS_MISSING_ACSURL,
                    errorType: ANALYTICS_API_ERROR,
                    message: `${THREEDS2_CHALLENGE_ERROR}: Decoded token is missing a valid acsURL property`,
                    metadata: { acsURL } // NEW TODO - check acsURL isn't secret
                };
                this.props.onSubmitAnalytics(errorCodeObject);

                console.debug('### PrepareChallenge3DS2::exiting:: no valid acsURL');
                return;
            }

            const { acsTransID, messageVersion, threeDSServerTransID } = (this.state.challengeData as ChallengeData).cReqData;

            // Only render component if we have a acsTransID, messageVersion & threeDSServerTransID
            if (!acsTransID || !messageVersion || !threeDSServerTransID) {
                // Set UI error & call onError callback
                this.setError(
                    {
                        errorInfo: `${Analytics3DS2Errors.TOKEN_IS_MISSING_OTHER_PROPS}: ${this.props.i18n.get('err.gen.9102')}`,
                        errorObj: this.state.challengeData
                    },
                    true
                );

                // Send error to analytics endpoint // TODO - check logs to see if this *ever* happens
                this.props.onSubmitAnalytics({
                    type: THREEDS2_ERROR,
                    code: Analytics3DS2Errors.TOKEN_IS_MISSING_OTHER_PROPS,
                    errorType: ANALYTICS_API_ERROR,
                    message: `${THREEDS2_CHALLENGE_ERROR}: Decoded token is missing one or more of the following properties (acsTransID | messageVersion | threeDSServerTransID)`
                });

                console.debug(
                    '### PrepareChallenge3DS2::exiting:: missing one or more of the following properties (acsTransID | messageVersion | threeDSServerTransID)'
                );
                return;
            }

            // Proceed to allow component to render
            this.setState({ status: 'performingChallenge' });
            //
        } else {
            const errorMsg: string = (this.state.challengeData as ErrorObject).error;

            const errorCode =
                errorMsg.indexOf(MISSING_TOKEN_IN_ACTION_MSG) > -1
                    ? Analytics3DS2Errors.ACTION_IS_MISSING_TOKEN
                    : Analytics3DS2Errors.TOKEN_DECODE_OR_PARSING_FAILED;

            // Set UI error & call onError callback
            this.setError(
                {
                    errorInfo:
                        errorMsg.indexOf(MISSING_TOKEN_IN_ACTION_MSG) > -1
                            ? `${Analytics3DS2Errors.ACTION_IS_MISSING_TOKEN}: ${this.props.i18n.get('err.gen.9102')}`
                            : `${Analytics3DS2Errors.TOKEN_DECODE_OR_PARSING_FAILED}:${this.props.i18n.get('err.gen.9102')}`,
                    errorObj: this.state.challengeData
                },
                true
            );

            // Send error to analytics endpoint // TODO - check logs to see if the base64 decoding errors *ever* happen
            this.props.onSubmitAnalytics({
                type: THREEDS2_ERROR,
                code: errorCode,
                errorType: ANALYTICS_API_ERROR,
                message: `${THREEDS2_CHALLENGE_ERROR}: ${errorMsg}` // can be: 'Missing "token" property from threeDS2 action', 'not base64', 'malformed URI sequence' or 'Could not JSON parse token'
            });

            console.debug('### PrepareChallenge3DS2::exiting:: no challengeData');
        }
    }

    setStatusComplete(resultObj: ResultObject, errorCodeObject: ErrorCodeObject = null) {
        this.setState({ status: 'complete' }, () => {
            /**
             * Create the data in the way that the /details endpoint expects.
             *  This is different for the flow triggered by the threeds2InMDFlow process than for the new, v67, 'threeDS2' action
             */
            const resolveDataFunction = this.props.isMDFlow ? createOldChallengeResolveData : createChallengeResolveData;
            const data = resolveDataFunction(this.props.dataKey, resultObj.transStatus, this.props.paymentData);

            if (errorCodeObject) {
                console.debug('### PrepareChallenge3DS2::errorCodeObject::', errorCodeObject);
            }

            // TODO - do we want to know about these events (timeout or no transStatus - which are "valid" 3DS2 scenarios) from an analytics perspective, and, if so, how do we classify them? ...errors? info?
            // let analyticsObject: SendAnalyticsObject;
            // const finalResObject = errorCodeObject ? errorCodeObject : resultObj;
            // if (finalResObject.errorCode) {
            //     const errorTypeAndCode = {
            //         code: finalResObject.errorCode === 'timeout' ? Analytics3DS2Errors.THREEDS2_TIMEOUT : Analytics3DS2Errors.NO_TRANSSTATUS,
            //         errorType: finalResObject.errorCode === 'timeout' ? ANALYTICS_NETWORK_ERROR : ANALYTICS_INTERNAL_ERROR // TODO - for a timeout is this really a Network error? Or is it a "ThirdParty" error i.e. the ACS has had a problem serving the fingerprinting page in a timely manner?
            //     };
            //
            //     // Challenge process has timed out,
            //     // or, It's an error reported by the backend 'cos no transStatus could be retrieved // TODO - check logs to see if this *ever* happens
            //     analyticsObject = {
            //         type: THREEDS2_ERROR,
            //         message: finalResObject.message,
            //         ...errorTypeAndCode
            //     };
            //
            //     // Send info about the error to analytics endpoint
            //     this.props.onSubmitAnalytics(analyticsObject);
            // }

            // Create log object - the process is completed, one way or another
            const analyticsObject: SendAnalyticsObject = {
                type: THREEDS2_FULL,
                message: `${THREEDS2_NUM} challenge has completed`,
                metadata: { ...resultObj }
            };

            // Send log to analytics endpoint
            this.props.onSubmitAnalytics(analyticsObject);

            /**
             * Equals call to onAdditionalDetails (except for in 3DS2InMDFlow)
             */
            this.props.onComplete(data);
        });
    }

    /**
     * Display error in the UI,
     * and, optionally, decide whether to send any of these errors to the merchant defined onError callback
     *
     * @param errorInfoObj -
     * @param isFatal -
     */
    setError(errorInfoObj: StatusErrorInfoObject, isFatal: boolean) {
        this.setState({ status: 'error', errorInfo: errorInfoObj.errorInfo });

        // Decide whether to call this.props.onError
        if (isFatal) {
            this.props.onError(
                new AdyenCheckoutError(
                    ERROR,
                    errorInfoObj.errorInfo
                    // { cause: errorInfoObj.errorObj }
                )
            );
        }
    }

    render(_, { challengeData }) {
        const getImage = useImage();
        if (this.state.status === 'performingChallenge') {
            return (
                <DoChallenge3DS2
                    onCompleteChallenge={(challenge: ThreeDS2FlowObject) => {
                        let errorCodeObject: ErrorCodeObject = null;

                        // Challenge has resulted in an error (no transStatus could be retrieved) - but we still treat this as a valid scenario
                        if (hasOwnProperty(challenge.result, 'errorCode') && challenge.result.errorCode.length) {
                            // Tell the merchant there's been an error
                            errorCodeObject = {
                                errorCode: challenge.result.errorCode,
                                message: `${THREEDS2_CHALLENGE_ERROR}: ${
                                    challenge.result.errorDescription ? challenge.result.errorDescription : 'no transStatus could be retrieved'
                                }`
                            };

                            /**
                             * NOTE: we can now use this.props.isMDFlow to decide if we want to send any of these errors to the onError handler
                             *  - this is problematic in the regular flow since merchants tend to treat any calls to their onError handler as 'fatal',
                             *   but in the MDFlow we control what the onError handler does.
                             */
                            if (this.props.isMDFlow) {
                                this.props.onError(
                                    new AdyenCheckoutError(
                                        ERROR,
                                        `${THREEDS2_CHALLENGE_ERROR}: ${
                                            challenge.result.errorDescription
                                                ? challenge.result.errorDescription
                                                : 'no transStatus could be retrieved'
                                        }`,
                                        { cause: challenge.result.errorCode }
                                    )
                                );
                            }
                        }

                        // Proceed with call to onAdditionalDetails (except for in 3DS2InMDFlow)
                        this.setStatusComplete(challenge.result, errorCodeObject);
                    }}
                    onErrorChallenge={(challenge: ThreeDS2FlowObject) => {
                        /**
                         * Called when challenge times-out (which is still a valid scenario)...
                         */
                        if (hasOwnProperty(challenge, 'errorCode')) {
                            const timeoutObject: ErrorCodeObject = {
                                errorCode: challenge.errorCode,
                                message: `${THREEDS2_CHALLENGE}: ${challenge.errorCode}`
                            };

                            // see comment in onCompleteChallenge code block
                            if (this.props.isMDFlow) {
                                this.props.onError(
                                    new AdyenCheckoutError(ERROR, `${THREEDS2_CHALLENGE_ERROR}: '3DS2 challenge timed out'`, {
                                        cause: challenge.errorCode
                                    })
                                );
                            }

                            this.setStatusComplete(challenge.result, timeoutObject);
                            return;
                        }
                    }}
                    {...challengeData}
                    onActionHandled={this.onActionHandled}
                    onFormSubmit={this.onFormSubmit}
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
