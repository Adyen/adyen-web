import { Component, h } from 'preact';
import classNames from 'classnames';
import Iframe from '../../../internal/IFrame';
import Spinner from '../../../internal/Spinner';
import ThreeDS2Form from '../Form';
import getProcessMessageHandler from '../../../../utils/get-process-message-handler';
import { encodeBase64URL } from '../utils';
import promiseTimeout from '../../../../utils/promiseTimeout';
import { CHALLENGE_TIMEOUT, UNKNOWN_CHALLENGE_RESOLVE_OBJECT_TIMEOUT, UNKNOWN_CHALLENGE_RESOLVE_OBJECT } from '../../config';
import { Do3DS2ChallengeProps, Do3DS2ChallengeState } from './types';

const iframeName = 'threeDSIframe';

class Do3DS2Challenge extends Component<Do3DS2ChallengeProps, Do3DS2ChallengeState> {
    private processMessageHandler;
    private challengePromise: { cancel: () => void; promise: Promise<any> };

    constructor(props) {
        super(props);

        /**
         * Create and Base64Url encode a JSON object containing the serverTransactionID & threeDSMethodNotificationURL
         */
        const jsonStr = JSON.stringify(this.props.cReqData);
        const base64URLencodedData = encodeBase64URL(jsonStr);
        this.state = { base64URLencodedData };
    }

    private iframeCallback() {
        this.setState({ status: 'iframeLoaded' });
    }

    private get3DS2ChallengePromise(): Promise<any> {
        return new Promise((resolve, reject) => {
            /**
             * Listen for postMessage responses from the notification url
             */
            this.processMessageHandler = getProcessMessageHandler(
                this.props.postMessageDomain,
                resolve,
                reject,
                UNKNOWN_CHALLENGE_RESOLVE_OBJECT,
                'challengeResult'
            );

            /* eslint-disable-next-line */
            window.addEventListener('message', this.processMessageHandler);
        });
    }

    componentDidMount() {
        // Render challenge
        this.challengePromise = promiseTimeout(CHALLENGE_TIMEOUT, this.get3DS2ChallengePromise(), UNKNOWN_CHALLENGE_RESOLVE_OBJECT_TIMEOUT);
        this.challengePromise.promise
            .then(resolveObject => {
                window.removeEventListener('message', this.processMessageHandler);
                this.props.onCompleteChallenge(resolveObject);
            })
            .catch(rejectObject => {
                window.removeEventListener('message', this.processMessageHandler);
                this.props.onErrorChallenge(rejectObject);
            });
    }

    componentWillUnmount() {
        this.challengePromise.cancel();
        window.removeEventListener('message', this.processMessageHandler);
    }

    render({ acsURL, cReqData, iframeSizeArr }, { base64URLencodedData, status }) {
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
                <ThreeDS2Form name={'cReqForm'} action={acsURL} target={iframeName} inputName={'creq'} inputValue={base64URLencodedData} />
            </div>
        );
    }
}

export default Do3DS2Challenge;
