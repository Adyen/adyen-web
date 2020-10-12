import { h } from 'preact';
import UIElement from '../UIElement';
import DeviceFingerprint from './components/DeviceFingerprint';
import { ErrorObject } from './components/utils';
import fetchJSONData from '../../utils/fetch-json-data';
import { PaymentAction } from '../../types';

export interface ThreeDS2DeviceFingerprintProps {
    dataKey: string;
    token: string;
    notificationURL: string;
    onError: (error?: string | ErrorObject) => void;
    paymentData: string;
    showSpinner: boolean;
    type: string;

    loadingContext?: string;
    clientKey?: string;
    elementRef?: UIElement;
}

class ThreeDS2DeviceFingerprint extends UIElement<ThreeDS2DeviceFingerprintProps> {
    public static type = 'threeDS2Fingerprint';

    public static defaultProps = {
        dataKey: 'threeds2.fingerprint',
        type: 'IdentifyShopper'
    };

    /**
     * Fingerprint, onComplete, calls a new endpoint which behaves like the /details endpoint but doesn't require the same credentials
     */
    onComplete(state): void {
        // TODO for testing - force the /details route
        // super.onComplete(state);
        // return;
        // TODO --

        // Handle call to new endpoint: perhaps called /submitThreeDS2Fingerprint
        fetchJSONData(
            {
                path: `v1/submitThreeDS2Fingerprint?token=${this.props.clientKey}`,
                loadingContext: this.props.loadingContext,
                method: 'POST',
                contentType: 'application/json'
            },
            {
                fingerprintResult: state.data.details[this.props.dataKey],
                clientKey: this.props.clientKey,
                paymentData: state.data.paymentData
            }
        ).then(data => {
            console.log('\n### ThreeDS2DeviceFingerprint::submitThreeDS2Fingerprint::response:: data', data);
            console.log('### ThreeDS2DeviceFingerprint::submitThreeDS2Fingerprint::response:: this=', this);
            console.log('### ThreeDS2DeviceFingerprint::handle response:: this.props=', this.props);
            /**
             * Frictionless (no challenge) flow
             */
            if (data.action?.type === 'authenticationFinished') {
                const detailsObj = {
                    data: {
                        // Sending no details property should work - BUT currently doesn't in the new flow
                        details: { 'threeds2.challengeResult': btoa('{"transStatus":"Y"}') },
                        paymentData: data.action.paymentData,
                        threeDSAuthenticationOnly: false
                    }
                };

                console.log('### ThreeDS2DeviceFingerprint::authenticationFinished FLOW:: detailsObj=', detailsObj);

                return super.onComplete(detailsObj);
            }

            /**
             * Challenge flow
             */
            if (data.action?.type === 'threeDS2') {
                console.log('### ThreeDS2DeviceFingerprint::submitThreeDS2Fingerprint::response:: challenge FLOW:: data.action=', data.action);
                this.props.elementRef.handleAction(data.action);
                return;
            }

            /**
             * Redirect (usecase: we thought we could do 3DS2 but it turns out we can't)
             */
            if (data.action?.type === 'redirect') {
                // const mockResp = {
                //     action: {
                //         url: 'http://localhost:8080/hpp/3d/validate.shtml',
                //         data: {
                //             MD:
                //                 'RE5acFVpOTNPZVk1V21HSXhJaTdlQT09IXM600f1RvNxlbrdXIfa7OcUrPlLGGjiCiQrrZ_d36mJcOyPTs4uFMJ-D8flYNkBEMmpp79ivNxUgnQ9TZZXwGfQnhv6J1Lz5uoZ_rmjcLvdfDZumz6gEH1RT5IBLHxIbxJoAVLmqIj1LErwukD6osuMSY8pb6w9WKlEYERve0H1irhkVjYVl7ElhmEncSZG5CLOGZc1DarkCz8M4NlSlgGuaY5fif75WxraCkyv7JwXmi6XymqSU9ZOjzXQ1SEd6YrScGYICkF_gL9pq_dvyGKiNbiVPRBc6B9LNxdDFwrn8oqWL3L_RtK6XJM9EDPXnkEsLftdkMNUQhaE5nr0ulyZ9rdwaoOt',
                //             PaReq:
                //                 'eNpVUttygjAQ/RXrB7AhoBZmzUyqztQHrVp87jBhp2ILaICi/fomCLXN0549ez0bjA6aaP5KqtYkcEVlGb/TIE2mwzAIvDHj3J+MPBYE48VQ4Ebu6Czwi3SZFrlwHeZwhB6adK0OcV4JjNX5abkWPne55yN0EDPSy7mIqKw2WSbVuU41aalUUecVwo3FPM5I7OWbnD2ENrSvitAy2EbrqxjxR4QeYK0/xaGqTiFA0zROnFwpd1SRAYKlEO7DbWprlabUJU3ES/TxvT7K6+q49dbRqjGY77bSvimCjcAkrkhwxpnLWDBweeiPQo8htH6MMzuDWOx3hmIO88y+NxeebCd5A4az1F8XGtU15eoqgondpUdIl1ORk4kw6v7aCPfBZ89WY1UZvfzAnYzNYP2zareErZIaaby2bwcQbCp0h4Tu4Mb69xF+AOaLrzY=',
                //             TermUrl: 'http://localhost:3020/cards/'
                //         },
                //         method: 'POST',
                //         type: 'redirect',
                //         paymentMethodType: 'scheme'
                //     }
                // };
                // this.props.elementRef.handleAction(mockResp.action);

                data.action.paymentMethodType = 'scheme';
                this.props.elementRef.handleAction(data.action);
            }
        });
    }

    render() {
        console.log('\n### ThreeDS2DeviceFingerprint::render:: this.props=', this.props);
        return <DeviceFingerprint {...this.props} onComplete={this.onComplete} />;
    }
}

export default ThreeDS2DeviceFingerprint;
