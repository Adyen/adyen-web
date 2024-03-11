import { Component, h } from 'preact';
import DoFingerprint3DS2 from './DoFingerprint3DS2';
import { createFingerprintResolveData, createOldFingerprintResolveData, ErrorCodeObject, isErrorObject, prepareFingerPrintData } from '../utils';
import { PrepareFingerprint3DS2Props, PrepareFingerprint3DS2State } from './types';
import { FingerPrintData, ResultObject } from '../../types';
import { ErrorObject } from '../../../../core/Errors/types';
import { SendAnalyticsObject } from '../../../../core/Analytics/types';
import { isValidHttpUrl } from '../../../../utils/isValidURL';
import { THREEDS2_FULL, THREEDS2_FINGERPRINT, THREEDS2_FINGERPRINT_ERROR, THREEDS2_NUM, MISSING_TOKEN_IN_ACTION_MSG } from '../../config';
import { ActionHandledReturnObject } from '../../../types';
import {
    ANALYTICS_API_ERROR,
    ANALYTICS_ERROR_CODE_ACTION_IS_MISSING_TOKEN,
    ANALYTICS_ERROR_CODE_TOKEN_IS_MISSING_THREEDSMETHODURL,
    ANALYTICS_ERROR_CODE_TOKEN_IS_MISSING_OTHER_PROPS,
    ANALYTICS_ERROR_CODE_TOKEN_DECODE_OR_PARSING_FAILED,
    ANALYTICS_ERROR_CODE_3DS2_TIMEOUT,
    ANALYTICS_NETWORK_ERROR
} from '../../../../core/Analytics/constants';

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
        const hasFingerPrintData = !isErrorObject(this.state.fingerPrintData); //!('success' in this.state.fingerPrintData && !this.state.fingerPrintData.success);

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
                        errorCode: ANALYTICS_ERROR_CODE_TOKEN_IS_MISSING_THREEDSMETHODURL,
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
                        errorCode: ANALYTICS_ERROR_CODE_TOKEN_IS_MISSING_OTHER_PROPS,
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
                    ? ANALYTICS_ERROR_CODE_ACTION_IS_MISSING_TOKEN
                    : ANALYTICS_ERROR_CODE_TOKEN_DECODE_OR_PARSING_FAILED;

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

    setStatusComplete(resultObj: ResultObject, errorCodeObject = null) {
        this.setState({ status: 'complete' }, () => {
            /**
             * Create the data in the way that the endpoint expects:
             *  - this will be the /details endpoint for the 'old', v66, flow triggered by a 'threeDS2Fingerprint' action
             *  - and will be the /submitThreeDS2Fingerprint endpoint for the new, v67, 'threeDS2' action
             */
            const resolveDataFunction = this.props.useOriginalFlow ? createOldFingerprintResolveData : createFingerprintResolveData;
            const data = resolveDataFunction(this.props.dataKey, resultObj, this.props.paymentData);

            let analyticsObject: SendAnalyticsObject;

            /** Are we in an error scenario? If so, submit analytics about it */
            const finalResObject = errorCodeObject ? errorCodeObject : resultObj;
            if (finalResObject.errorCode) {
                const errorTypeAndCode = {
                    code: finalResObject.errorCode === 'timeout' ? ANALYTICS_ERROR_CODE_3DS2_TIMEOUT : finalResObject.errorCode,
                    errorType: finalResObject.errorCode === 'timeout' ? ANALYTICS_NETWORK_ERROR : ANALYTICS_API_ERROR // TODO - for a timeout is this really a Network error? Or is it a "ThirdParty" error i.e. the ACS has had a problem serving the fingerprinting page in a timely manner?
                };

                // Fingerprint process has timed out, // TODO - do we want to know about this timeout event (which is a "valid" 3DS2 scenario) from an analytics perspective, and, if so, how do we classify it? ...error? info?
                // or, Decoded token is missing a valid threeDSMethodURL property (threeDSCompInd:"U"),
                // or, (threeDSCompInd:"N"):
                //  - decoded token is missing one or more of the following properties (threeDSMethodNotificationURL | postMessageDomain | threeDSServerTransID)
                //  - or, token could not be base64 decoded &/or JSON.parsed
                analyticsObject = {
                    message: finalResObject.message,
                    metadata: { errorCodeObject, resultObject: resultObj }, // pass along both the full error object as well as the result object that came from the backend
                    ...errorTypeAndCode
                };

                // Send error to analytics endpoint
                this.props.onSubmitAnalytics(analyticsObject);
            }

            /** The fingerprint process is completed, one way or another */
            analyticsObject = {
                type: THREEDS2_FULL,
                message: `${THREEDS2_NUM} fingerprinting has completed`,
                // TODO can we use metadata this way?
                metadata: { resultObject: resultObj, ...(errorCodeObject && { errorCodeObject }) } // if the fingerprint has concluded due to an error - also pass this information along
            };

            // Send log to analytics endpoint
            this.props.onSubmitAnalytics(analyticsObject);

            /**
             * For 'threeDS2' action = call to callSubmit3DS2Fingerprint
             * For 'threeDS2Fingerprint' action = equals call to onAdditionalDetails (except for in 3DS2InMDFlow)
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
                            errorCode: fingerprint.errorCode,
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
