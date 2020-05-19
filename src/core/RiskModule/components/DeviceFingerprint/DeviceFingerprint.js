import { Component, h } from 'preact';
import GetDeviceFingerprint from './GetDeviceFingerprint';
import handleErrorCode from './utils';
import { DF_VERSION } from '../../constants';

class DeviceFingerprint extends Component {
    constructor(props) {
        super(props);

        if (this.props.originKey) {
            this.state = {
                status: 'retrievingFingerPrint',
                dfpURL: `${this.props.loadingContext}assets/html/${this.props.originKey}/dfp.${DF_VERSION}.html`
            };
        }
    }

    static defaultProps = {
        onComplete: () => {},
        onError: () => {}
    };

    setStatusComplete(fingerprintResult) {
        this.setState({ status: 'complete' }, () => {
            this.props.onComplete(fingerprintResult);
        });
    }

    render({ loadingContext }, { dfpURL }) {
        if (this.state.status === 'retrievingFingerPrint') {
            return (
                <div className="adyen-checkout-risk__device-fingerprint--wrapper" style={{ position: 'absolute', width: 0, height: 0 }}>
                    <GetDeviceFingerprint
                        loadingContext={loadingContext}
                        dfpURL={dfpURL}
                        onCompleteFingerprint={fingerprintResult => {
                            this.setStatusComplete(fingerprintResult);
                        }}
                        onErrorFingerprint={fingerprintError => {
                            this.props.onError(handleErrorCode(fingerprintError.errorCode));
                            this.setStatusComplete(fingerprintError.result);
                        }}
                    />
                </div>
            );
        }

        return null;
    }
}

export default DeviceFingerprint;
