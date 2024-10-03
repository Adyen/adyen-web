import { Component, h } from 'preact';
import classNames from 'classnames';
import Iframe from '../../../internal/IFrame';
import Spinner from '../../../internal/Spinner';
import ThreeDS2Form from '../Form';
import getProcessMessageHandler from '../../../../utils/get-process-message-handler';
import { encodeBase64URL } from '../utils';
import promiseTimeout from '../../../../utils/promiseTimeout';
import { CHALLENGE_TIMEOUT, CHALLENGE_TIMEOUT_REJECT_OBJECT, THREEDS2_NUM } from '../../constants';
import { DoChallenge3DS2Props, DoChallenge3DS2State } from './types';
import { ThreeDS2FlowObject } from '../../types';

const iframeName = 'threeDSIframe';

class DoChallenge3DS2 extends Component<DoChallenge3DS2Props, DoChallenge3DS2State> {
    private processMessageHandler;
    private challengePromise: { cancel: () => void; promise: Promise<any> };

    constructor(props) {
        super(props);

        /**
         * Create and Base64Url encode a JSON object containing the serverTransactionID & threeDSMethodNotificationURL
         */
        const jsonStr = JSON.stringify(this.props.cReqData);
        const base64URLencodedData = encodeBase64URL(jsonStr);
        this.state = { base64URLencodedData, status: 'init' };
    }

    private iframeCallback = () => {
        this.setState({ status: 'iframeLoaded' });
        // On Test - actually calls-back 3 times: once for challenge screen, once again as challenge.html reloads after the challenge is submitted, and once for redirect to threeDSNotificationURL.
        // But for the purposes of calling the merchant defined onActionHandled callback - we only want to do it once
        if (this.state.status === 'init') {
            this.props.onActionHandled({ componentType: '3DS2Challenge', actionDescription: `${THREEDS2_NUM} challenge iframe loaded` });
        }
    };

    private get3DS2ChallengePromise(): Promise<any> {
        return new Promise((resolve, reject) => {
            /**
             * Listen for postMessage responses from the notification url
             */
            this.processMessageHandler = getProcessMessageHandler(this.props.postMessageDomain, resolve, reject, 'challengeResult');

            window.addEventListener('message', this.processMessageHandler);
        });
    }

    componentDidMount() {
        // Render challenge
        this.challengePromise = promiseTimeout(CHALLENGE_TIMEOUT, this.get3DS2ChallengePromise(), CHALLENGE_TIMEOUT_REJECT_OBJECT);
        this.challengePromise.promise
            .then((resolveObject: ThreeDS2FlowObject) => {
                window.removeEventListener('message', this.processMessageHandler);
                this.props.onCompleteChallenge(resolveObject);
            })
            /** Catch, for when Challenge times-out */
            .catch((rejectObject: ThreeDS2FlowObject) => {
                window.removeEventListener('message', this.processMessageHandler);
                this.props.onErrorChallenge(rejectObject);
            });
    }

    componentWillUnmount() {
        if (this.challengePromise) this.challengePromise.cancel();
        window.removeEventListener('message', this.processMessageHandler);
    }

    render({ acsURL, cReqData, iframeSizeArr, onFormSubmit }, { base64URLencodedData, status }) {
        const [width, height] = iframeSizeArr;

        return (
            <div
                className={classNames([
                    'adyen-checkout__threeds2__challenge',
                    `adyen-checkout__threeds2__challenge--${cReqData.challengeWindowSize}`
                ])}
            >
                {status !== 'iframeLoaded' && <Spinner />}

                <Iframe name={iframeName} width={width} height={height} callback={this.iframeCallback} />
                <ThreeDS2Form
                    name={'cReqForm'}
                    action={acsURL}
                    target={iframeName}
                    inputName={'creq'}
                    inputValue={base64URLencodedData}
                    onFormSubmit={onFormSubmit}
                />
            </div>
        );
    }
}

export default DoChallenge3DS2;
