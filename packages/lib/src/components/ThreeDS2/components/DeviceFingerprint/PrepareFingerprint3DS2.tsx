import { Component, h } from 'preact';
import DoFingerprint3DS2 from './DoFingerprint3DS2';
import { createFingerprintResolveData, createOldFingerprintResolveData, ErrorCodeObject, prepareFingerPrintData } from '../utils';
import { PrepareFingerprint3DS2Props, PrepareFingerprint3DS2State } from './types';
import { FingerPrintData, ResultObject, ThreeDS2AnalyticsObject } from '../../types';
import { ErrorObject } from '../../../../core/Errors/types';
import { isValidHttpUrl } from '../../../../utils/isValidURL';
import { THREEDS2_FULL, THREEDS2_FINGERPRINT, THREEDS2_FINGERPRINT_ERROR, THREEDS2_NUM } from '../../config';
import { ActionHandledReturnObject } from '../../../types';
import {
    ANALYTICS_DATA_ERROR,
    ANALYTICS_DATA_LOG,
    ANALYTICS_API_ERROR,
    ANALYTICS_ERROR_ACTION_IS_MISSING_TOKEN,
    ANALYTICS_ERROR_TOKEN_IS_MISSING_THREEDSMETHODURL,
    ANALYTICS_ERROR_TOKEN_IS_MISSING_OTHER_PROPS,
    ANALYTICS_ERROR_TOKEN_DECODE_OR_PARSING_FAILED,
    ANALYTICS_ERROR_3DS2_FINGERPRINT_TIMEOUT
} from '../../../../core/Analytics/constants';

class PrepareFingerprint3DS2 extends Component<PrepareFingerprint3DS2Props, PrepareFingerprint3DS2State> {
    public static type = 'scheme';

    constructor(props) {
        super(props);

        const { token, notificationURL } = this.props; // See comments on prepareFingerPrintData regarding notificationURL

        if (token) {
            const fingerPrintData: FingerPrintData | ErrorObject = prepareFingerPrintData({ token, notificationURL });

            this.state = {
                status: 'init',
                fingerPrintData: fingerPrintData as FingerPrintData,
                hasCompleted: false
            };
        } else {
            this.state = { status: 'error' };
            // TODO - confirm that we should do this, or is it possible to proceed to the challenge anyway?
            //  ...in which case we should console.debug the error object and then call: this.setStatusComplete({ threeDSCompInd: 'N' });
            this.props.onError({
                errorCode: this.props.dataKey,
                message: `${THREEDS2_FINGERPRINT_ERROR}: Missing 'token' property from threeDS2 action`
            });

            // Send error to analytics endpoint // TODO - check logs to see if this *ever* happens
            this.submitAnalytics({
                class: ANALYTICS_DATA_ERROR,
                code: ANALYTICS_ERROR_ACTION_IS_MISSING_TOKEN,
                errorType: ANALYTICS_API_ERROR,
                message: `${THREEDS2_FINGERPRINT_ERROR}: Missing 'token' property from threeDS2 action`
            });
        }
    }

    public static defaultProps = {
        onComplete: () => {},
        onError: () => {},
        paymentData: '',
        showSpinner: true,
        onActionHandled: () => {},
        isMDFlow: false
    };

    public submitAnalytics = (what: ThreeDS2AnalyticsObject) => {
        // console.log('### PrepareFingerprint3DS2::submitAnalytics:: what', what);
        this.props.onSubmitAnalytics(what);
    };

    public onActionHandled = (rtnObj: ActionHandledReturnObject) => {
        this.submitAnalytics({ class: ANALYTICS_DATA_LOG, type: THREEDS2_FULL, message: rtnObj.actionDescription });
        this.props.onActionHandled(rtnObj);

        // Allow unmounting to proceed
        this.setState({ hasCompleted: true });
    };

    componentDidMount() {
        const hasFingerPrintData = !('success' in this.state.fingerPrintData && !this.state.fingerPrintData.success);

        if (hasFingerPrintData) {
            /**
             * Check the structure of the created fingerPrintData
             */
            const { threeDSMethodURL, threeDSMethodNotificationURL, postMessageDomain, threeDSServerTransID } = this.state
                .fingerPrintData as FingerPrintData;
            const hasValid3DSMethodURL = isValidHttpUrl(threeDSMethodURL);

            // Only render component if we have a threeDSMethodURL. Otherwise, exit with threeDSCompInd: 'U'
            if (!hasValid3DSMethodURL) {
                this.setStatusComplete({ threeDSCompInd: 'U' });

                // Send error to analytics endpoint // TODO - check logs to see if this *ever* happens
                this.submitAnalytics({
                    class: ANALYTICS_DATA_ERROR,
                    code: ANALYTICS_ERROR_TOKEN_IS_MISSING_THREEDSMETHODURL,
                    errorType: ANALYTICS_API_ERROR,
                    message: `${THREEDS2_FINGERPRINT_ERROR}: Decoded token is missing a valid threeDSMethodURL property`
                });

                // TODO - we can now use this.props.isMDFlow to decide if we want to send any of these errors to the onError handler
                //  - this is problematic in the regular flow since merchants tend to treat any calls to their onError handler as 'fatal',
                //  but in the MDFlow we control what the onError handler does.

                console.debug('### PrepareFingerprint3DS2::exiting:: no valid threeDSMethodURL');
                return;
            }

            const hasValid3DSMethodNotificationURL = isValidHttpUrl(threeDSMethodNotificationURL);
            const hasValidPostMessageDomain = isValidHttpUrl(postMessageDomain);
            const hasTransServerID = threeDSServerTransID?.length;

            if (!hasValid3DSMethodNotificationURL || !hasValidPostMessageDomain || !hasTransServerID) {
                // Send error to analytics endpoint // TODO - check logs to see if this *ever* happens
                this.submitAnalytics({
                    class: ANALYTICS_DATA_ERROR,
                    code: ANALYTICS_ERROR_TOKEN_IS_MISSING_OTHER_PROPS,
                    errorType: ANALYTICS_API_ERROR,
                    message: `${THREEDS2_FINGERPRINT_ERROR}: Decoded token is missing one or more of the following properties (threeDSMethodNotificationURL | postMessageDomain | threeDSServerTransID)`
                });
                return;
            }

            // Proceed to allow component to render
            this.setState({ status: 'retrievingFingerPrint' });
        } else {
            // Only render component if we have fingerPrintData. Otherwise, exit with threeDSCompInd: 'U'
            this.setStatusComplete({ threeDSCompInd: 'U' });

            // Send error to analytics endpoint 'cos base64 decoding or JSON.parse has failed on the token // TODO - check logs to see if this *ever* happens
            this.submitAnalytics({
                class: ANALYTICS_DATA_ERROR,
                code: ANALYTICS_ERROR_TOKEN_DECODE_OR_PARSING_FAILED,
                errorType: 'token decoding or parsing has failed',
                message: `${THREEDS2_FINGERPRINT_ERROR}: ${(this.state.fingerPrintData as ErrorObject).error}`
            }); // can be: 'not base64', 'malformed URI sequence' or 'Could not JSON parse token'

            console.debug('### PrepareFingerprint3DS2::exiting:: no fingerPrintData');
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

            const finalResObject = errorCodeObject ? errorCodeObject : resultObj;

            let analyticsObject: ThreeDS2AnalyticsObject;

            // *Currently* errorCodeObject (& therefore finalResObject.errorCode) will only be true in the fingerprint timeout scenario
            if (finalResObject.errorCode) {
                analyticsObject = {
                    class: ANALYTICS_DATA_ERROR,
                    code: ANALYTICS_ERROR_3DS2_FINGERPRINT_TIMEOUT,
                    errorType: finalResObject.errorCode,
                    message: finalResObject.message,
                    metaData: JSON.stringify(finalResObject)
                };

                this.setState({ hasCompleted: true });
            } else {
                analyticsObject = {
                    class: ANALYTICS_DATA_LOG,
                    type: THREEDS2_FULL,
                    message: `${THREEDS2_NUM} fingerprinting has succeeded`,
                    metaData: JSON.stringify(finalResObject)
                };
            }

            // Send log to analytics endpoint
            this.submitAnalytics(analyticsObject);

            /**
             * For 'threeDS2' action = call to callSubmit3DS2Fingerprint
             * For 'threeDS2Fingerprint' action = equals call to onAdditionalDetails (except for in 3DS2InMDFlow)
             */
            this.props.onComplete(data);
        });
    }

    render({ showSpinner }, { status, fingerPrintData, hasCompleted }) {
        // Use state.hasCompleted to hold back unmounting until the iframe has either loaded or timed-out
        // This allows us time to hear from, and process, the iframe onload callback (in onActionHandled) before we unmount
        if (status === 'retrievingFingerPrint' || !hasCompleted) {
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

                        this.setStatusComplete(fingerprint.result, timeoutObject);
                    }}
                    showSpinner={showSpinner}
                    {...fingerPrintData}
                    onActionHandled={this.onActionHandled}
                    onSubmitAnalytics={this.submitAnalytics}
                />
            );
        }

        return null;
    }
}

export default PrepareFingerprint3DS2;
