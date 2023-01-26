import { httpPost } from '../../core/Services/http';
import { pick } from '../internal/SecuredFields/utils';
import { ThreeDS2FingerprintResponse } from './types';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';

/**
 * ThreeDS2DeviceFingerprint, onComplete, calls a new, internal, endpoint which
 * behaves like the /details endpoint but doesn't require the same credentials
 */
export default function callSubmit3DS2Fingerprint({ data }): void {
    httpPost<ThreeDS2FingerprintResponse>(
        {
            path: `v1/submitThreeDS2Fingerprint?token=${this.props.clientKey}`,
            loadingContext: this.props.loadingContext,
            errorLevel: 'fatal'
        },
        {
            ...data
        }
    )
        .then(resData => {
            // elementRef exists when the fingerprint component is created from the Dropin
            const actionHandler = this.props.elementRef ?? this;

            if (!actionHandler) {
                console.error('Handled Error::callSubmit3DS2Fingerprint::FAILED:: actionHandler=', actionHandler);
                return;
            }

            if (!resData.action && !resData.details) {
                console.error('Handled Error::callSubmit3DS2Fingerprint::FAILED:: resData=', resData);
                return;
            }

            /**
             * Frictionless (no challenge) flow OR "refused" flow
             */
            if (resData.type === 'completed') {
                const { details } = resData;
                return this.onComplete({ data: { details } });
            }

            /**
             * Challenge flow
             */
            if (resData.action?.type === 'threeDS2') {
                // Ensure challengeWindowSize is propagated if there was a (merchant defined) handleAction call proceeding this one that had it set as an option
                return actionHandler.handleAction(resData.action, pick('challengeWindowSize').from(this.props));
            }

            /**
             * Redirect (usecase: we thought we could do 3DS2 but it turns out we can't)
             */
            if (resData.action?.type === 'redirect') {
                return actionHandler.handleAction(resData.action);
            }
        })
        .catch((error: AdyenCheckoutError) => {
            this.handleError(error);
        });
}
