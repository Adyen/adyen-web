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
import { THREEDS2_CHALLENGE, THREEDS2_CHALLENGE_ERROR, THREEDS2_FULL, THREEDS2_NUM, MISSING_TOKEN_IN_ACTION_MSG } from '../../constants';
import { isValidHttpUrl } from '../../../../utils/isValidURL';
import { ANALYTICS_ERROR_TYPE, Analytics3DS2Errors, Analytics3DS2Events } from '../../../../core/Analytics/constants';
import { ErrorObject } from '../../../../core/Errors/types';
import { AnalyticsLogEvent } from '../../../../core/Analytics/AnalyticsLogEvent';
import { AnalyticsErrorEvent } from '../../../../core/Analytics/AnalyticsErrorEvent';
import { AnalyticsEvent } from '../../../../core/Analytics/AnalyticsEvent';

class PrepareChallenge3DS2 extends Component<PrepareChallenge3DS2Props, PrepareChallenge3DS2State> {
    public static defaultProps = {
        onComplete: () => {},
        onError: () => {},
        isMDFlow: false
    };

    constructor(props) {
        super(props);

        if (this.props.token) {
            const challengeData: ChallengeData | ErrorObject = prepareChallengeData({
                token: this.props.token,
                size: this.props.challengeWindowSize || this.props.size // TODO confirm that this.props.size is legacy and can be removed
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

    public onFormSubmit = (msg: string) => {
        const event = new AnalyticsLogEvent({
            type: THREEDS2_FULL,
            message: msg,
            subType: Analytics3DS2Events.CHALLENGE_DATA_SENT
        });

        this.props.onSubmitAnalytics(event);
    };

    componentDidMount() {
        const hasChallengeData = !isErrorObject(this.state.challengeData);

        if (hasChallengeData) {
            const shouldAllowHttpDomains =
                /** Allow http urls if in development and testing against localhost:8080 */
                (process.env.NODE_ENV === 'development' && process.env.__CLIENT_ENV__?.indexOf('localhost:8080') > -1) ||
                /**
                 * Allows the checkoutshopper demo on localhost:8080 to work -
                 *  requires a configuration in localhost of environment: 'test', _environmentUrls: {api: 'http://localhost:8080/'}
                 */
                (this.props.environment === 'test' && this.props._environmentUrls?.api?.includes('http://localhost:8080'));

            /**
             * Check the structure of the created challengeData
             */
            const { acsURL } = this.state.challengeData as ChallengeData;
            const hasValidAcsURL = isValidHttpUrl(acsURL, shouldAllowHttpDomains);

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
                const event = new AnalyticsErrorEvent({
                    code: Analytics3DS2Errors.TOKEN_IS_MISSING_ACSURL,
                    errorType: ANALYTICS_ERROR_TYPE.apiError,
                    message: `${THREEDS2_CHALLENGE_ERROR}: Decoded token is missing a valid acsURL property`
                });
                this.props.onSubmitAnalytics(event);

                console.debug('### PrepareChallenge3DS2::exiting:: no valid acsURL');
                return;
            }

            const { acsTransID, messageVersion, threeDSServerTransID } = (this.state.challengeData as ChallengeData).cReqData;

            // Only render component if we have a acsTransID, messageVersion & threeDSServerTransID
            if (!acsTransID || !messageVersion || !threeDSServerTransID) {
                // Set UI error & call onError callback
                this.setError(
                    {
                        errorInfo: `${Analytics3DS2Errors.TOKEN_IS_MISSING_OTHER_PROPS}: ${this.props.i18n.get('err.gen.9102')}`
                        // errorObj: this.state.challengeData // TODO Decide if we want to expose this data
                    },
                    true
                );

                // Send error to analytics endpoint // TODO - check logs to see if this *ever* happens
                const event = new AnalyticsErrorEvent({
                    code: Analytics3DS2Errors.TOKEN_IS_MISSING_OTHER_PROPS,
                    errorType: ANALYTICS_ERROR_TYPE.apiError,
                    message: `${THREEDS2_CHALLENGE_ERROR}: Decoded token is missing one or more of the following properties (acsTransID | messageVersion | threeDSServerTransID)`
                });
                this.props.onSubmitAnalytics(event);

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
                            : `${Analytics3DS2Errors.TOKEN_DECODE_OR_PARSING_FAILED}: ${this.props.i18n.get('err.gen.9102')}`
                    // errorObj: this.state.challengeData // TODO Decide if we want to expose this data
                },
                true
            );

            // Send error to analytics endpoint // TODO - check logs to see if the base64 decoding errors *ever* happen
            const event = new AnalyticsErrorEvent({
                code: errorCode,
                errorType: ANALYTICS_ERROR_TYPE.apiError,
                message: `${THREEDS2_CHALLENGE_ERROR}: ${errorMsg}` // can be: 'Missing "token" property from threeDS2 action', 'not base64', 'malformed URI sequence' or 'Could not JSON parse token'
            });

            this.props.onSubmitAnalytics(event);

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

            let event: AnalyticsEvent;

            /** Are we in an "error" i.e. timeout or no transStatus, scenario? If so, submit analytics about it */
            const finalResObject = errorCodeObject ? errorCodeObject : resultObj;
            if (finalResObject.errorCode) {
                const errorTypeAndCode = {
                    code: finalResObject.errorCode === 'timeout' ? Analytics3DS2Errors.THREEDS2_TIMEOUT : Analytics3DS2Errors.NO_TRANSSTATUS,
                    errorType: finalResObject.errorCode === 'timeout' ? ANALYTICS_ERROR_TYPE.network : ANALYTICS_ERROR_TYPE.apiError
                };

                // Challenge process has timed out,
                // or, It's an error reported by the backend 'cos no transStatus could be retrieved // TODO - check logs to see if this *ever* happens

                event = new AnalyticsErrorEvent({
                    message: (finalResObject as ErrorCodeObject).message,
                    ...errorTypeAndCode
                });

                // Send error to analytics endpoint
                this.props.onSubmitAnalytics(event);
            }

            /** Calculate "result" for analytics */
            let result: string;

            switch (resultObj?.transStatus) {
                case 'Y':
                    result = 'success';
                    break;
                case 'N':
                    result = 'failed';
                    break;
                case 'U':
                    result = !errorCodeObject ? 'cancelled' : 'timeout';
                    break;
                default:
            }
            if (resultObj?.errorCode) {
                result = 'noTransStatus';
            }

            /** Create log object - the process is completed, one way or another */

            event = new AnalyticsLogEvent({
                type: THREEDS2_FULL,
                message: `${THREEDS2_NUM} challenge has completed`,
                subType: Analytics3DS2Events.CHALLENGE_COMPLETED,
                result
            });

            // Send log to analytics endpoint
            this.props.onSubmitAnalytics(event);

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
            this.props.onError(new AdyenCheckoutError(ERROR, errorInfoObj.errorInfo, { cause: errorInfoObj.errorObj }));
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

                        /**
                         * An object has been returned, parsed & accepted as legit (according to the rules in getProcessMessageHandler),
                         * but the result prop on that object is missing
                         */
                        if (!challenge.result) {
                            this.setError(
                                {
                                    errorInfo: `${THREEDS2_CHALLENGE_ERROR}:  ${this.props.i18n.get('3ds.chal.805', {
                                        values: { result: '"result"' }
                                    })}`,
                                    errorObj: challenge as unknown as ErrorObject
                                },
                                true
                            );

                            // Send error to analytics endpoint
                            const event = new AnalyticsErrorEvent({
                                code: Analytics3DS2Errors.CHALLENGE_RESOLVED_WITHOUT_RESULT_PROP,
                                errorType: ANALYTICS_ERROR_TYPE.apiError,
                                message: `${THREEDS2_CHALLENGE_ERROR}: challenge resolved without a "result" object`
                            });

                            this.props.onSubmitAnalytics(event);

                            console.debug('### PrepareChallenge3DS2::exiting:: challenge resolved without a "result" object');

                            return;
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
                    onActionHandled={this.props.onActionHandled}
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
