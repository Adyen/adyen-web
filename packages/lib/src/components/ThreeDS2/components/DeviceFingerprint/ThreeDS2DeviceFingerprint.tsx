import { Component, h } from 'preact';
import Get3DS2DeviceFingerprint from './Get3DS2DeviceFingerprint';
import { createResolveData, encodeResult, handleErrorCode, prepareFingerPrintData } from '../utils';
import { ThreeDS2DeviceFingerprintProps, ThreeDS2DeviceFingerprintState } from './types';
import { ResultObject } from '../../types';

class ThreeDS2DeviceFingerprint extends Component<ThreeDS2DeviceFingerprintProps, ThreeDS2DeviceFingerprintState> {
    public static type = 'scheme';

    constructor(props) {
        super(props);

        const { fingerprintToken, notificationURL } = this.props;

        if (fingerprintToken) {
            const fingerPrintData = prepareFingerPrintData({ fingerprintToken, notificationURL });

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
        // If no fingerPrintData, don't even bother
        if (!this.state.fingerPrintData) {
            this.setStatusComplete({ threeDSCompInd: 'U' });
            return;
        }

        // If no methodURL - don't render component. Instead exit with threeDSCompInd: 'U'
        if (!this.state.fingerPrintData.methodURL || !this.state.fingerPrintData.methodURL.length) {
            this.setStatusComplete({ threeDSCompInd: 'U' });
            return;
        }

        // Render
        this.setState({ status: 'retrievingFingerPrint' });
    }

    setStatusComplete(resultObj: ResultObject) {
        this.setState({ status: 'complete' }, () => {
            console.log('### ThreeDS2DeviceFingerprint::resultObj:: ', resultObj);
            const paymentData = this.props.paymentData;
            const result = encodeResult(resultObj, this.props.type);
            const data = createResolveData(this.props.dataKey, result, paymentData, true);
            this.props.onComplete(data);
        });
    }

    render(props, { fingerPrintData }) {
        if (this.state.status === 'retrievingFingerPrint') {
            return (
                <Get3DS2DeviceFingerprint
                    onCompleteFingerprint={fingerprint => {
                        this.setStatusComplete(fingerprint.result);
                    }}
                    onErrorFingerprint={fingerprint => {
                        const errorObject = handleErrorCode(fingerprint.errorCode);
                        this.props.onError(errorObject);
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

export default ThreeDS2DeviceFingerprint;
