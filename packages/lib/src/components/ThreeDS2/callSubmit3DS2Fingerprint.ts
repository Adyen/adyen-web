import fetchJSONData from '../../utils/fetch-json-data';

/**
 * ThreeDS2DeviceFingerprint, onComplete, calls a new, internal, endpoint which behaves like the /details endpoint but doesn't require the same credentials
 */
export default function callSubmit3DS2Fingerprint({ data }) {
    fetchJSONData(
        {
            path: `v1/submitThreeDS2Fingerprint?token=${this.props.clientKey}`,
            loadingContext: this.props.loadingContext,
            method: 'POST',
            contentType: 'application/json',
            clientKey: this.props.clientKey
        },
        {
            ...data
        }
    ).then(resData => {
        // elementRef exists when the fingerprint component is created from the Dropin
        const actionHandler = this.props.elementRef ?? this;

        if (!resData.action && !resData.details) {
            console.error('Handled Error::callSubmit3DS2Fingerprint::FAILED:: resData=', resData);
            return;
        }

        /**
         * Frictionless (no challenge) flow
         */
        if (resData.type === 'completed') {
            const { details } = resData;
            return this.onComplete({ data: { details } });
        }

        /**
         * Challenge flow
         */
        if (resData.action?.type === 'threeDS2') {
            return actionHandler.handleAction(resData.action);
        }

        /**
         * Redirect (usecase: we thought we could do 3DS2 but it turns out we can't)
         */
        if (resData.action?.type === 'redirect') {
            return actionHandler.handleAction(resData.action);
        }
    });
}
