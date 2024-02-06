import { Component, h } from 'preact';
import DoFingerprint3DS2 from './DoFingerprint3DS2';
import { createFingerprintResolveData, createOldFingerprintResolveData, handleErrorCode, prepareFingerPrintData } from '../utils';
import { PrepareFingerprint3DS2Props, PrepareFingerprint3DS2State } from './types';
import { FingerPrintData, ResultObject } from '../../types';
import AdyenCheckoutError, { ERROR } from '../../../../core/Errors/AdyenCheckoutError';
import { THREEDS2_FINGERPRINT_ERROR } from '../../config';

class PrepareFingerprint3DS2 extends Component<PrepareFingerprint3DS2Props, PrepareFingerprint3DS2State> {
    public static type = 'scheme';

    constructor(props) {
        super(props);

        const { token, notificationURL } = this.props; // See comments on prepareFingerPrintData regarding notificationURL

        if (token) {
            const fingerPrintData: FingerPrintData = prepareFingerPrintData({ token, notificationURL });

            this.state = {
                status: 'init',
                fingerPrintData
            };
        } else {
            this.state = { status: 'error' };
            // TODO - confirm that we should do this, or is it possible to proceed to the challenge anyway?
            //  ...in which case we should console.debug the error object and then call: this.setStatusComplete({ threeDSCompInd: 'N' });
            this.props.onError(new AdyenCheckoutError(ERROR, `${THREEDS2_FINGERPRINT_ERROR}: Missing "token" property from 3DS2Fingerprint action`));
        }
    }

    public static defaultProps = {
        onComplete: () => {},
        onError: () => {},
        paymentData: '',
        showSpinner: true,
        onActionHandled: () => {}
    };

    componentDidMount() {
        // If no fingerPrintData or no threeDSMethodURL - don't render component. Instead exit with threeDSCompInd: 'U'
        if (!this.state.fingerPrintData || !this.state.fingerPrintData.threeDSMethodURL) {
            this.setStatusComplete({ threeDSCompInd: 'U' });
            console.debug('### PrepareFingerprint3DS2::exiting:: no fingerPrintData or no threeDSMethodURL');
            return;
        }

        // Render
        this.setState({ status: 'retrievingFingerPrint' });
    }

    setStatusComplete(resultObj: ResultObject) {
        this.setState({ status: 'complete' }, () => {
            /**
             * Create the data in the way that the /details endpoint expects.
             *  This is different for the flow triggered by the threeds2InMDFlow process than for the new, v67, 'threeDS2' action
             */
            const resolveDataFunction = this.props.isMDFlow ? createOldFingerprintResolveData : createFingerprintResolveData;
            const data = resolveDataFunction(this.props.dataKey, resultObj, this.props.paymentData);

            /**
             * For 'threeDS2' action = call to callSubmit3DS2Fingerprint
             * For 'threeDS2Fingerprint' action = equals call to onAdditionalDetails (except for in 3DS2InMDFlow)
             */
            this.props.onComplete(data);
        });
    }

    render({ showSpinner, onActionHandled }, { fingerPrintData }) {
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
                        const errorCodeObject = handleErrorCode(fingerprint.errorCode);
                        console.debug('### PrepareFingerprint3DS2::fingerprint timed-out:: errorCodeObject=', errorCodeObject);
                        this.setStatusComplete(fingerprint.result);
                    }}
                    showSpinner={showSpinner}
                    {...fingerPrintData}
                    onActionHandled={onActionHandled}
                />
            );
        }

        return null;
    }
}

export default PrepareFingerprint3DS2;
