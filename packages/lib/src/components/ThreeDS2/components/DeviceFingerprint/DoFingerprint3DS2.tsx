import { Component, h } from 'preact';
import Iframe from '../../../internal/IFrame';
import Spinner from '../../../internal/Spinner';
import ThreeDS2Form from '../Form';
import promiseTimeout from '../../../../utils/promiseTimeout';
import getProcessMessageHandler from '../../../../utils/get-process-message-handler';
import { FAILED_METHOD_STATUS_RESOLVE_OBJECT, THREEDS_METHOD_TIMEOUT, FAILED_METHOD_STATUS_RESOLVE_OBJECT_TIMEOUT } from '../../config';
import { encodeBase64URL } from '../utils';
import { DoFingerprint3DS2Props, DoFingerprint3DS2State } from './types';

const iframeName = 'threeDSMethodIframe';

/**
 * Create and Base64URL encode a JSON object containing the serverTransactionID & threeDSMethodNotificationURL.
 * This Base64URL string will be added to the <form> in the ThreeDS2Form component.
 * The ThreeDS2Form component will submit the <form> when it mounts, using the ThreeDS2Iframe as the <form> target.
 * getProcessMessageHandler will listen for the postMessage response from the notificationURL and will settle the
 * promise accordingly causing this component to call the appropriate callback.
 * The callbacks exist in the parent component: ThreeDS2DeviceFingerprint where they ultimately call the onComplete
 * function passed as a prop when checkout.create('threeDS2DeviceFingerprint') is called.
 */
class DoFingerprint3DS2 extends Component<DoFingerprint3DS2Props, DoFingerprint3DS2State> {
    private processMessageHandler;
    private fingerPrintPromise: any;
    public static defaultProps = {
        showSpinner: true
    };

    constructor(props) {
        super(props);

        /**
         * Create and Base64URL encode a JSON object
         */
        const { threeDSServerTransID, threeDSMethodNotificationURL } = this.props;

        const jsonStr = JSON.stringify({
            threeDSServerTransID,
            threeDSMethodNotificationURL
        });
        const base64URLencodedData = encodeBase64URL(jsonStr);
        this.state = { base64URLencodedData };
    }

    get3DS2MethodPromise() {
        return new Promise((resolve, reject) => {
            /**
             * Listen for postMessage responses from the notification url
             */
            this.processMessageHandler = getProcessMessageHandler(
                this.props.postMessageDomain,
                resolve,
                reject,
                FAILED_METHOD_STATUS_RESOLVE_OBJECT,
                'fingerPrintResult'
            );

            /* eslint-disable-next-line */
            window.addEventListener('message', this.processMessageHandler);
        });
    }

    componentDidMount() {
        // Check 3DS2 Device fingerprint
        this.fingerPrintPromise = promiseTimeout(THREEDS_METHOD_TIMEOUT, this.get3DS2MethodPromise(), FAILED_METHOD_STATUS_RESOLVE_OBJECT_TIMEOUT);
        this.fingerPrintPromise.promise
            .then(resolveObject => {
                window.removeEventListener('message', this.processMessageHandler);
                this.props.onCompleteFingerprint(resolveObject);
            })
            .catch(rejectObject => {
                window.removeEventListener('message', this.processMessageHandler);
                this.props.onErrorFingerprint(rejectObject);
            });
    }

    componentWillUnmount() {
        if (this.fingerPrintPromise) this.fingerPrintPromise.cancel();
        window.removeEventListener('message', this.processMessageHandler);
    }

    render({ threeDSMethodURL }, { base64URLencodedData }) {
        return (
            <div className="adyen-checkout__3ds2-device-fingerprint">
                {this.props.showSpinner && <Spinner />}
                <div style={{ display: 'none' }}>
                    <Iframe name={iframeName} />
                    <ThreeDS2Form
                        name={'threeDSMethodForm'}
                        action={threeDSMethodURL}
                        target={iframeName}
                        inputName={'threeDSMethodData'}
                        inputValue={base64URLencodedData}
                    />
                </div>
            </div>
        );
    }
}

export default DoFingerprint3DS2;
