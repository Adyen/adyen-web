import { Component, h } from 'preact';
import DoFingerprint3DS2 from './DoFingerprint3DS2';
import { createFingerprintResolveData, createOldFingerprintResolveData, ErrorCodeObject, prepareFingerPrintData } from '../utils';
import { PrepareFingerprint3DS2Props, PrepareFingerprint3DS2State } from './types';
import { FingerPrintData, ResultObject } from '../../types';
import { ErrorObject } from '../../../../core/Errors/types';
import { isValidHttpUrl } from '../../../../utils/isValidURL';
import { THREEDS2_FINGERPRINT, THREEDS2_FINGERPRINT_ERROR } from '../../config';
import { ActionHandledReturnObject } from '../../../types';

class PrepareFingerprint3DS2 extends Component<PrepareFingerprint3DS2Props, PrepareFingerprint3DS2State> {
    public static type = 'scheme';

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
            this.state = { status: 'error' };
            // TODO - confirm that we should do this, or is it possible to proceed to the challenge anyway?
            //  ...in which case we should console.debug the error object and then call: this.setStatusComplete({ threeDSCompInd: 'N' });
            this.props.onError({
                errorCode: this.props.dataKey,
                message: `${THREEDS2_FINGERPRINT_ERROR}: Missing 'token' property from threeDS2 action`
            });

            // TODO send error to analytics endpoint
            this.submitAnalytics(`${THREEDS2_FINGERPRINT_ERROR}: Missing 'token' property from threeDS2 action`);
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

    public submitAnalytics = what => {
        this.props.onSubmitAnalytics(what);
    };

    public onActionHandled = (rtnObj: ActionHandledReturnObject) => {
        this.submitAnalytics(rtnObj.actionDescription);
        this.props.onActionHandled(rtnObj);
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

                // TODO send error to analytics endpoint
                this.submitAnalytics(`${THREEDS2_FINGERPRINT_ERROR}: Decoded token is missing a valid threeDSMethodURL property`);

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
                // TODO send error to analytics endpoint
                this.submitAnalytics(
                    `${THREEDS2_FINGERPRINT_ERROR}: Decoded token is missing one or more of the following properties (threeDSMethodNotificationURL | postMessageDomain | threeDSServerTransID)`
                );
                return;
            }

            // Proceed to allow component to render
            this.setState({ status: 'retrievingFingerPrint' });
        } else {
            // Only render component if we have fingerPrintData. Otherwise, exit with threeDSCompInd: 'U'
            this.setStatusComplete({ threeDSCompInd: 'U' });

            // TODO send error to analytics endpoint 'cos base64 decoding or JSON.parse has failed on the token
            this.submitAnalytics(`${THREEDS2_FINGERPRINT_ERROR}: ${(this.state.fingerPrintData as ErrorObject).error}`); // can be: 'not base64', 'malformed URI sequence' or 'Could not JSON parse token'

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

            console.log('### PrepareFingerprint3DS2::setStatusComplete:: resultObj=', resultObj);

            const finalResObject = errorCodeObject ? errorCodeObject : resultObj;

            // TODO send log to analytics endpoint - we can use errorCodeObject.errorCode to set the log object's "actionType" as either “timeout" or "result”
            this.submitAnalytics(
                `${THREEDS2_FINGERPRINT}: onComplete, result:${JSON.stringify(finalResObject)}, reason:${
                    finalResObject.errorCode ? finalResObject.errorCode : 'process-complete'
                }`
            );

            /**
             * For 'threeDS2' action = call to callSubmit3DS2Fingerprint
             * For 'threeDS2Fingerprint' action = equals call to onAdditionalDetails (except for in 3DS2InMDFlow)
             */
            this.props.onComplete(data);
        });
    }

    render({ showSpinner }, { fingerPrintData }) {
        if (this.state.status === 'retrievingFingerPrint') {
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
