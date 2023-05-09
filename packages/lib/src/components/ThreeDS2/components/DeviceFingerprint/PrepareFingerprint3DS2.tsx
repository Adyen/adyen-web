import { Component, h } from 'preact';
import DoFingerprint3DS2 from './DoFingerprint3DS2';
import { createFingerprintResolveData, createOldFingerprintResolveData, prepareFingerPrintData } from '../utils';
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
        onActionHandled: () => {}
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
            const { threeDSMethodURL } = this.state.fingerPrintData as FingerPrintData;
            const hasValid3DSMethodURL = isValidHttpUrl(threeDSMethodURL);

            // TODO send error to analytics endpoint? - if any of these are false:
            // const hasValid3DSMethodNotificationURL = isValidHttpUrl(threeDSMethodNotificationURL);
            // const hasValidPostMessageDomain = isValidHttpUrl(postMessageDomain);
            // const hasTransServerID = threeDSServerTransID?.length;

            // Only render component if we have a threeDSMethodURL. Otherwise, exit with threeDSCompInd: 'U'
            if (!hasValid3DSMethodURL) {
                this.setStatusComplete({ threeDSCompInd: 'U' });

                // TODO send error to analytics endpoint
                this.submitAnalytics(`${THREEDS2_FINGERPRINT_ERROR}: Decoded token is missing a threeDSMethodURL property`);

                console.debug('### PrepareFingerprint3DS2::exiting:: no threeDSMethodURL');
                return;
            }

            // Proceed to render component
            this.setState({ status: 'retrievingFingerPrint' });
        } else {
            // Only render component if we have fingerPrintData. Otherwise, exit with threeDSCompInd: 'U'
            this.setStatusComplete({ threeDSCompInd: 'U' });

            // TODO send error to analytics endpoint 'cos base64 decoding or JSON.parse has failed on the token
            this.submitAnalytics(`${THREEDS2_FINGERPRINT_ERROR}: ${(this.state.fingerPrintData as ErrorObject).error}`); // can be: 'not base64', 'malformed URI sequence' or 'Could not JSON parse token'

            console.debug('### PrepareFingerprint3DS2::exiting:: no fingerPrintData');
        }
    }

    setStatusComplete(resultObj: ResultObject, timeoutObject = null) {
        this.setState({ status: 'complete' }, () => {
            /**
             * Create the data in the way that the endpoint expects:
             *  - this will be the /details endpoint for the 'old', v66, flow triggered by a 'threeDS2Fingerprint' action
             *  - and will be the /submitThreeDS2Fingerprint endpoint for the new, v67, 'threeDS2' action
             */
            const resolveDataFunction = this.props.useOriginalFlow ? createOldFingerprintResolveData : createFingerprintResolveData;
            const data = resolveDataFunction(this.props.dataKey, resultObj, this.props.paymentData);

            const finalResObject = timeoutObject ? timeoutObject : resultObj;

            // TODO send log to analytics endpoint - we can use timeoutObject to set the log object's "actionType" as either “timeout" or "result”
            this.submitAnalytics(`${THREEDS2_FINGERPRINT}: onComplete, result:${JSON.stringify(finalResObject)}`);

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
                        const timeoutObject = {
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
