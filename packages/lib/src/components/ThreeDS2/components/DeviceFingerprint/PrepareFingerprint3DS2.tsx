import { Component, h } from 'preact';
import DoFingerprint3DS2 from './DoFingerprint3DS2';
import { createFingerprintResolveData, createOldFingerprintResolveData, handleErrorCode, prepareFingerPrintData } from '../utils';
import { PrepareFingerprint3DS2Props, PrepareFingerprint3DS2State } from './types';
import { FingerPrintData, ResultObject } from '../../types';

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
            this.props.onError('Missing fingerprintToken parameter');
        }
    }

    public static defaultProps = {
        onComplete: () => {},
        onError: () => {},
        paymentData: '',
        showSpinner: true
    };

    componentDidMount() {
        // If no fingerPrintData or no threeDSMethodURL - don't render component. Instead exit with threeDSCompInd: 'U'
        if (!this.state.fingerPrintData || !this.state.fingerPrintData.threeDSMethodURL) {
            this.setStatusComplete({ threeDSCompInd: 'U' });
            return;
        }

        // Render
        this.setState({ status: 'retrievingFingerPrint' });
    }

    setStatusComplete(resultObj: ResultObject) {
        this.setState({ status: 'complete' }, () => {
            /**
             * Create the data in the way that the endpoint expects:
             *  - this will be the /details endpoint for the 'old', v66, flow triggered by a 'threeDS2Fingerprint' action
             *  - and will be the /submitThreeDS2Fingerprint endpoint for the new, v67, 'threeDS2' action
             */
            const resolveDataFunction = this.props.useOriginalFlow ? createOldFingerprintResolveData : createFingerprintResolveData;
            const data = resolveDataFunction(this.props.dataKey, resultObj, this.props.paymentData);

            this.props.onComplete(data);
        });
    }

    render(props, { fingerPrintData }) {
        if (this.state.status === 'retrievingFingerPrint') {
            return (
                <DoFingerprint3DS2
                    onCompleteFingerprint={fingerprint => {
                        this.setStatusComplete(fingerprint.result);
                    }}
                    onErrorFingerprint={fingerprint => {
                        const errorCodeObject = handleErrorCode(fingerprint.errorCode);
                        this.props.onError(errorCodeObject);
                        this.setStatusComplete(fingerprint.result);
                    }}
                    showSpinner={this.props.showSpinner}
                    {...fingerPrintData}
                />
            );
        }

        return null;
    }
}

export default PrepareFingerprint3DS2;
