import { Component, h } from 'preact';
import DoFingerprint3DS2 from './DoFingerprint3DS2';
import { createFingerprintResolveData, createOldFingerprintResolveData, isErrorObject, prepareFingerPrintData } from '../utils';
import { PrepareFingerprint3DS2Props, PrepareFingerprint3DS2State } from './types';
import { FingerPrintData, ResultObject, ErrorCodeObject } from '../../types';
import { ErrorObject } from '../../../../core/Errors/types';
import { ActionHandledReturnObject } from '../../../../types/global-types';
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
import { ANALYTICS_API_ERROR, Analytics3DS2Errors, ANALYTICS_NETWORK_ERROR } from '../../../../core/Analytics/constants';

class PrepareFingerprint3DS2 extends Component<PrepareFingerprint3DS2Props, PrepareFingerprint3DS2State> {
    public static type = 'scheme';

    public static defaultProps = {
        onComplete: () => {},
        onError: () => {},
        paymentData: '',
        showSpinner: true,
        onActionHandled: () => {},
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

    public onActionHandled = (rtnObj: ActionHandledReturnObject) => {
        // Leads to an "iframe loaded" log action
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
        const hasFingerPrintData = !isErrorObject(this.state.fingerPrintData);

        if (hasFingerPrintData) {
            const shouldAllowHttpDomains = process.env.NODE_ENV === 'development' && process.env.__CLIENT_ENV__?.indexOf('localhost:8080') > -1; // allow http urls if in development and testing against localhost:8080

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
                    errorType: finalResObject.errorCode === TIMEOUT ? ANALYTICS_NETWORK_ERROR : ANALYTICS_API_ERROR // TODO - for a timeout is this really a Network error? Or is it a "ThirdParty" error i.e. the ACS has had a problem serving the fingerprinting page in a timely manner?
                };

                /**
                 * Timeout or data parsing problems:
                 *
                 * (threeDSCompInd:"U"):
                 *   - Decoded token is missing a valid threeDSMethodURL property,
                 *  or, (threeDSCompInd:"N"):
                 *   - Fingerprint process has timed out, // TODO - do we want to know about this timeout event (which is a "valid" 3DS2 scenario) from an analytics perspective, and, if so, how do we classify it? ...error? info?
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

            /**
             * The fingerprint process is completed, one way or another.
             * The resultObj will be {threeDSCompInd:"Y"} in the case of success,
             * else {threeDSCompInd:"U"} or {threeDSCompInd:"N"} - if we've had some kind of timeout or data parsing problem (as described above)
             */
            analyticsObject = {
                type: THREEDS2_FULL,
                message: `${THREEDS2_NUM} fingerprinting has completed`,
                metadata: { ...resultObj }
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
                    onActionHandled={this.onActionHandled}
                    onFormSubmit={this.onFormSubmit}
                />
            );
        }

        return null;
    }
}

export default PrepareFingerprint3DS2;
