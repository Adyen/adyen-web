import { httpPost } from '../../core/Services/http';
import { pick } from '../internal/SecuredFields/utils';
import { ThreeDS2FingerprintResponse } from './types';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { THREEDS2_FINGERPRINT_SUBMIT } from './config';

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
            /**
             * Frictionless (no challenge) flow OR "refused" flow
             */
            if (resData.type === 'completed') {
                const { details } = resData;

                if (!resData.details) {
                    this.submitAnalytics(`${THREEDS2_FINGERPRINT_SUBMIT}: no details object in a response indicating a "frictionless" flow`);
                    return;
                }

                return this.onComplete({ data: { details } });
            }

            if (!resData.action) {
                console.error('Handled Error::callSubmit3DS2Fingerprint::FAILED:: no action object in "challenge" response resData=', resData);

                this.submitAnalytics(`${THREEDS2_FINGERPRINT_SUBMIT}: no action object in a response indicating a "challenge" flow`);
                return;
            }

            // elementRef exists when the fingerprint component is created from the Dropin
            const actionHandler = this.props.elementRef ?? this;

            // TODO - does this ever happen?
            if (!actionHandler) {
                console.error('Handled Error::callSubmit3DS2Fingerprint::FAILED:: actionHandler=', actionHandler);
                this.submitAnalytics(`${THREEDS2_FINGERPRINT_SUBMIT}: no component defined to handle the action response`);
                return;
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
             * TODO - does this ever happen, anymore?
             */
            if (resData.action?.type === 'redirect') {
                return actionHandler.handleAction(resData.action);
            }
        })
        .catch((error: AdyenCheckoutError) => {
            this.handleError(error);
        });
}
