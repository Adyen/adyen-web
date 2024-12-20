import { Component, h } from 'preact';
import DoFingerprint3DS2 from './DoFingerprint3DS2';
import { createFingerprintResolveData, createOldFingerprintResolveData, isErrorObject, prepareFingerPrintData } from '../utils';
import { PrepareFingerprint3DS2Props, PrepareFingerprint3DS2State } from './types';
import { FingerPrintData, ResultObject, ErrorCodeObject } from '../../types';
import { ErrorObject } from '../../../../core/Errors/types';
import { SendAnalyticsObject } from '../../../../core/Analytics/types';
import { isValidHttpUrl } from '../../../../utils/isValidURL';
import {
    THREEDS2_FULL,
    THREEDS2_FINGERPRINT,
    THREEDS2_FINGERPRINT_ERROR,
    THREEDS2_NUM,
    MISSING_TOKEN_IN_ACTION_MSG,
    THREEDS2_ERROR,
    TIMEOUT
} from '../../constants';
import { ANALYTICS_ERROR_TYPE, Analytics3DS2Errors, Analytics3DS2Events } from '../../../../core/Analytics/constants';

class PrepareFingerprint3DS2 extends Component<PrepareFingerprint3DS2Props, PrepareFingerprint3DS2State> {
    public static type = 'scheme';

    public static defaultProps = {
        onComplete: () => {},
        onError: () => {},
        paymentData: '',
        showSpinner: true,
        isMDFlow: false
    };

    constructor(props) {
        super(props);

        const { token, notificationURL } = this.props; // See comments on prepareFingerPrintData regarding notificationURL

        if (token) {
            const fingerPrintData: FingerPrintData | ErrorObject = prepareFingerPrintData({ token, notificationURL });

            this.state = {
                status: 'init',
                fingerPrintData: fingerPrintData as FingerPrintData
            };
        } else {
            // Will be picked up in componentDidMount
            this.state = { fingerPrintData: { success: false, error: MISSING_TOKEN_IN_ACTION_MSG } };

            console.debug(`${THREEDS2_FINGERPRINT_ERROR}: ${MISSING_TOKEN_IN_ACTION_MSG}`);
        }
    }

    public onFormSubmit = (msg: string) => {
        this.props.onSubmitAnalytics({
            type: THREEDS2_FULL,
            message: msg,
            subtype: Analytics3DS2Events.FINGERPRINT_DATA_SENT
        });
    };

    componentDidMount() {
        const hasFingerPrintData = !isErrorObject(this.state.fingerPrintData);

        if (hasFingerPrintData) {
            const shouldAllowHttpDomains =
                /** Allow http urls if in development and testing against localhost:8080 */
                (process.env.NODE_ENV === 'development' && process.env.__CLIENT_ENV__?.indexOf('localhost:8080') > -1) ||
                /**
                 * Allows the checkoutshopper demo on localhost:8080 to work -
                 *  requires a configuration in localhost of environment: 'test', _environmentUrls: {api: 'http://localhost:8080/'}
                 */
                (this.props.environment === 'test' && this.props._environmentUrls?.api?.includes('http://localhost:8080'));

            /**
             * Check the structure of the created fingerPrintData
             */
            const { threeDSMethodURL, threeDSMethodNotificationURL, postMessageDomain, threeDSServerTransID } = this.state
                .fingerPrintData as FingerPrintData;

            const hasValid3DSMethodURL = isValidHttpUrl(threeDSMethodURL, shouldAllowHttpDomains);

            // Only render component if we have a threeDSMethodURL. Otherwise, exit with threeDSCompInd: 'U'
            if (!hasValid3DSMethodURL) {
                this.setStatusComplete(
                    { threeDSCompInd: 'U' },
                    {
                        errorCode: Analytics3DS2Errors.TOKEN_IS_MISSING_THREEDSMETHODURL,
                        message: `${THREEDS2_FINGERPRINT_ERROR}: Decoded token is missing a valid threeDSMethodURL property`
                    }
                );

                /**
                 * NOTE: we can now use this.props.isMDFlow to decide if we want to send any of these errors to the onError handler
                 *  - this is problematic in the regular flow since merchants tend to treat any calls to their onError handler as 'fatal',
                 *   but in the MDFlow we control what the onError handler does.
                 */
                // if (this.props.isMDFlow) {}

                console.debug('### PrepareFingerprint3DS2::exiting:: no valid threeDSMethodURL');
                return;
            }

            const hasValid3DSMethodNotificationURL = isValidHttpUrl(threeDSMethodNotificationURL, shouldAllowHttpDomains);
            const hasValidPostMessageDomain = isValidHttpUrl(postMessageDomain, shouldAllowHttpDomains);
            const hasTransServerID = threeDSServerTransID?.length;

            if (!hasValid3DSMethodNotificationURL || !hasValidPostMessageDomain || !hasTransServerID) {
                /**
                 * NOTE: EMVCo_3DS_CoreSpec_v2.3.1_20220831.pdf states that we should return: threeDSCompInd: 'N'
                 * when the fingerprinting process "Did not run or did not successfully complete"
                 */
                this.setStatusComplete(
                    { threeDSCompInd: 'N' },
                    {
                        errorCode: Analytics3DS2Errors.TOKEN_IS_MISSING_OTHER_PROPS,
                        message: `${THREEDS2_FINGERPRINT_ERROR}: Decoded token is missing one or more of the following properties (threeDSMethodNotificationURL | postMessageDomain | threeDSServerTransID)`
                    }
                );

                console.debug(
                    '### PrepareFingerprint3DS2::exiting:: Decoded token is missing one or more of the following properties (threeDSMethodNotificationURL | postMessageDomain | threeDSServerTransID)'
                );

                return;
            }

            // Proceed to allow component to render
            this.setState({ status: 'retrievingFingerPrint' });
            //
        } else {
            // Only render component if we have fingerPrintData. Otherwise, complete with threeDSCompInd: 'N'

            const errorMsg: string = (this.state.fingerPrintData as ErrorObject).error;

            const errorCode =
                errorMsg.indexOf(MISSING_TOKEN_IN_ACTION_MSG) > -1
                    ? Analytics3DS2Errors.ACTION_IS_MISSING_TOKEN
                    : Analytics3DS2Errors.TOKEN_DECODE_OR_PARSING_FAILED;

            this.setStatusComplete(
                { threeDSCompInd: 'N' },
                {
                    errorCode,
                    message: `${THREEDS2_FINGERPRINT_ERROR}: ${errorMsg}` // can be: 'Missing "token" property from threeDS2 action', 'not base64', 'malformed URI sequence' or 'Could not JSON parse token'
                }
            );

            console.debug('### PrepareFingerprint3DS2:: token does not exist or could not be base64 decoded &/or JSON.parsed');
        }
    }

    setStatusComplete(resultObj: ResultObject, errorCodeObject: ErrorCodeObject = null) {
        this.setState({ status: 'complete' }, () => {
            /**
             * Create the data in the way that the /details endpoint expects.
             *  This is different for the flow triggered by the threeds2InMDFlow process than for the new, v67, 'threeDS2' action
             */
            const resolveDataFunction = this.props.isMDFlow ? createOldFingerprintResolveData : createFingerprintResolveData;
            const data = resolveDataFunction(this.props.dataKey, resultObj, this.props.paymentData);

            let analyticsObject: SendAnalyticsObject;

            /** Are we in an error scenario? If so, submit analytics about it */
            const finalResObject = errorCodeObject ? errorCodeObject : resultObj;
            if (finalResObject.errorCode) {
                const errorTypeAndCode = {
                    code: finalResObject.errorCode === TIMEOUT ? Analytics3DS2Errors.THREEDS2_TIMEOUT : finalResObject.errorCode,
                    errorType: finalResObject.errorCode === TIMEOUT ? ANALYTICS_ERROR_TYPE.network : ANALYTICS_ERROR_TYPE.apiError
                };

                /**
                 * Timeout or data parsing problems:
                 *
                 * (threeDSCompInd:"U"):
                 *   - Decoded token is missing a valid threeDSMethodURL property,
                 *  or, (threeDSCompInd:"N"):
                 *   - Fingerprint process has timed out,
                 *  also, (threeDSCompInd:"N"):
                 *   - Missing "token" property from threeDS2 action
                 *   - or, decoded token is missing one or more of the following properties (threeDSMethodNotificationURL | postMessageDomain | threeDSServerTransID)
                 *   - or, token could not be base64 decoded &/or JSON.parsed
                 */
                analyticsObject = {
                    type: THREEDS2_ERROR,
                    message: (finalResObject as ErrorCodeObject).message,
                    ...errorTypeAndCode
                };

                // Send error to analytics endpoint
                this.props.onSubmitAnalytics(analyticsObject);
            }

            /** Calculate "result" for analytics */
            let result: string;

            switch (resultObj?.threeDSCompInd) {
                case 'Y':
                    result = 'success';
                    break;
                case 'N': {
                    if (!errorCodeObject) {
                        result = 'failed'; // 'failed' is the result returned from the threeDSMethodURL
                    } else {
                        result = errorCodeObject.errorCode === TIMEOUT ? TIMEOUT : 'failedInternal'; // timed-out; or, 'failed' as a result of internal checks
                    }
                    break;
                }
                case 'U':
                    result = 'noThreeDSMethodURL';
                    break;
                default:
            }

            /**
             * The fingerprint process is completed, one way or another.
             * The resultObj will be {threeDSCompInd:"Y"} in the case of success,
             * else {threeDSCompInd:"U"} or {threeDSCompInd:"N"} - if we've had some kind of timeout or data parsing problem (as described above)
             */
            analyticsObject = {
                type: THREEDS2_FULL,
                message: `${THREEDS2_NUM} fingerprinting has completed`,
                subtype: Analytics3DS2Events.FINGERPRINT_COMPLETED,
                result
            };

            // Send log to analytics endpoint
            this.props.onSubmitAnalytics(analyticsObject);

            /**
             * Equals call to callSubmit3DS2Fingerprint (except for in 3DS2InMDFlow)
             */
            this.props.onComplete(data);
        });
    }

    render({ showSpinner }, { status, fingerPrintData }) {
        if (status === 'retrievingFingerPrint') {
            return (
                <DoFingerprint3DS2
                    onCompleteFingerprint={fingerprint => {
                        this.setStatusComplete(fingerprint.result);
                    }}
                    onErrorFingerprint={fingerprint => {
                        /**
                         * Called when fingerprint times-out (which is still a valid scenario)...
                         */
                        const timeoutObject: ErrorCodeObject = {
                            errorCode: fingerprint.errorCode, // 'timeout'
                            message: `${THREEDS2_FINGERPRINT}: ${fingerprint.errorCode}`
                        };

                        this.setStatusComplete(fingerprint.result, timeoutObject); // fingerprint.result = threeDSCompInd: 'N'
                    }}
                    showSpinner={showSpinner}
                    {...fingerPrintData}
                    onActionHandled={this.props.onActionHandled}
                    onFormSubmit={this.onFormSubmit}
                />
            );
        }

        return null;
    }
}

export default PrepareFingerprint3DS2;
