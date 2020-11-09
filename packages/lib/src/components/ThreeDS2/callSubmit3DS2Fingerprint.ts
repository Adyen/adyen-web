import fetchJSONData from '../../utils/fetch-json-data';

/**
 * ThreeDS2DeviceFingerprint, onComplete, calls a new, internal, endpoint which behaves like the /details endpoint but doesn't require the same credentials
 */
export default function callSubmit3DS2Fingerprint(state) {
    fetchJSONData(
        {
            path: `v1/submitThreeDS2Fingerprint?token=${this.props.clientKey}`,
            loadingContext: this.props.loadingContext,
            method: 'POST',
            contentType: 'application/json',
            clientKey: this.props.clientKey
        },
        {
            fingerprintResult: state.data.details[this.props.dataKey],
            paymentData: state.data.paymentData
        }
    ).then(data => {
        // elementRef exists when the fingerprint component is created from the Dropin
        const actionHandler = this.props.elementRef ?? this;

        if (!data.action) {
            console.error('Handled Error::callSubmit3DS2Fingerprint::FAILED:: data=', data);
            return;
        }

        /**
         * Frictionless (no challenge) flow
         */
        if (data.action?.type === 'authenticationFinished') {
            const detailsObj = {
                data: {
                    // Sending no details property should work - BUT currently doesn't in the new flow
                    details: { 'threeds2.challengeResult': btoa('{"transStatus":"Y"}') },
                    paymentData: data.action.paymentData
                }
            };

            return this.onComplete(detailsObj);
        }

        /**
         * Challenge flow
         */
        if (data.action?.type === 'threeDS2') {
            return actionHandler.handleAction(data.action);
        }

        /**
         * Redirect (usecase: we thought we could do 3DS2 but it turns out we can't)
         */
        if (data.action?.type === 'redirect') {
            return actionHandler.handleAction(data.action);
        }
    });
}
