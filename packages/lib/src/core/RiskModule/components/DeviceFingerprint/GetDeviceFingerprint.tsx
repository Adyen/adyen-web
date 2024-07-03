import { Component, h } from 'preact';
import Iframe from '../../../../components/internal/IFrame';
import promiseTimeout from '../../../../utils/promiseTimeout';
import { DEVICE_FINGERPRINT, DF_TIMEOUT, FAILED_DFP_RESOLVE_OBJECT_TIMEOUT } from '../../constants';
import getProcessMessageHandler from '../../../../utils/get-process-message-handler';
import { getOrigin } from '../../../../utils/getOrigin';
import { GetDeviceFingerprintProps } from './types';

const iframeName = 'dfIframe';
const allowProperties = 'geolocation; microphone; camera;';

class GetDeviceFingerprint extends Component<GetDeviceFingerprintProps> {
    public postMessageDomain;
    public processMessageHandler;
    public deviceFingerPrintPromise;

    constructor(props) {
        super(props);

        this.postMessageDomain = getOrigin(this.props.loadingContext) || this.props.loadingContext;
    }

    getDfpPromise(): Promise<any> {
        return new Promise((resolve, reject) => {
            /**
             * Listen for postMessage responses from the notification url
             */
            this.processMessageHandler = getProcessMessageHandler(this.postMessageDomain, resolve, reject, DEVICE_FINGERPRINT);

            window.addEventListener('message', this.processMessageHandler);
        });
    }

    componentDidMount() {
        // Get device fingerprint
        this.deviceFingerPrintPromise = promiseTimeout(DF_TIMEOUT, this.getDfpPromise(), FAILED_DFP_RESOLVE_OBJECT_TIMEOUT);
        this.deviceFingerPrintPromise.promise
            .then(resolveObject => {
                this.props.onCompleteFingerprint(resolveObject);
                window.removeEventListener('message', this.processMessageHandler);
            })
            .catch(rejectObject => {
                this.props.onErrorFingerprint(rejectObject);
                window.removeEventListener('message', this.processMessageHandler);
            });
    }

    render({ dfpURL }) {
        return (
            <div className="adyen-checkout-risk__device-fingerprint">
                <Iframe name={iframeName} src={dfpURL} allow={allowProperties} title="devicefingerprinting iframe" />
            </div>
        );
    }
}

export default GetDeviceFingerprint;
