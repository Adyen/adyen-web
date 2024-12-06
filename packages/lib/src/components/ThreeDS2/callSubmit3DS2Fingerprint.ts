import { httpPost } from '../../core/Services/http';
import { pick } from '../../utils/commonUtils';
import { ThreeDS2FingerprintResponse } from './types';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { THREEDS2_ERROR, THREEDS2_FINGERPRINT_SUBMIT } from './constants';
import { ANALYTICS_ERROR_TYPE, Analytics3DS2Errors } from '../../core/Analytics/constants';
import { SendAnalyticsObject } from '../../core/Analytics/types';

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
            let analyticsErrorObject: SendAnalyticsObject;

            /**
             * Frictionless (no challenge) flow OR "refused" flow
             */
            if (resData.type === 'completed') {
                const { details } = resData;

                if (!resData.details) {
                    console.debug(
                        'Handled Error::callSubmit3DS2Fingerprint::FAILED:: no details object in a response indicating either a "frictionless" flow, or a "refused" response. resData=',
                        resData
                    );

                    analyticsErrorObject = {
                        type: THREEDS2_ERROR,
                        code: Analytics3DS2Errors.NO_DETAILS_FOR_FRICTIONLESS_OR_REFUSED,
                        errorType: ANALYTICS_ERROR_TYPE.apiError,
                        message: `${THREEDS2_FINGERPRINT_SUBMIT}: no details object in a response indicating either a "frictionless" flow, or a "refused" response`
                    };

                    this.submitAnalytics(analyticsErrorObject);
                    return;
                }

                return this.onComplete({ data: { details } });
            }

            /**
             * If we don't have a type: "completed", then we expect an action, because we must be in a Challenge or Redirect flow
             */
            if (!resData.action) {
                console.debug(
                    'Handled Error::callSubmit3DS2Fingerprint::FAILED:: no action object in a response indicating a "challenge". resData=',
                    resData
                );

                analyticsErrorObject = {
                    type: THREEDS2_ERROR,
                    code: Analytics3DS2Errors.NO_ACTION_FOR_CHALLENGE,
                    errorType: ANALYTICS_ERROR_TYPE.apiError,
                    message: `${THREEDS2_FINGERPRINT_SUBMIT}: no action object in a response indicating a "challenge" flow`
                };
                this.submitAnalytics(analyticsErrorObject);
                return;
            }

            // elementRef exists when the fingerprint component is created from the Dropin
            const actionHandler = this.props.elementRef ?? this;

            /**
             * We have an action but do we have a way to handle it?
             * TODO - check logs: do we ever *not* have an actionHandler?
             */
            if (!actionHandler) {
                console.debug('Handled Error::callSubmit3DS2Fingerprint::FAILED:: no actionHandler');

                analyticsErrorObject = {
                    type: THREEDS2_ERROR,
                    code: Analytics3DS2Errors.NO_COMPONENT_FOR_ACTION,
                    errorType: ANALYTICS_ERROR_TYPE.sdkError,
                    message: `${THREEDS2_FINGERPRINT_SUBMIT}: no component defined to handle the action response`
                };
                this.submitAnalytics(analyticsErrorObject);
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
             * Redirect flow (usecase: we thought we could do 3DS2 but it turns out we can't)
             * TODO - check logs: does this ever happen, anymore?
             */
            if (resData.action?.type === 'redirect') {
                return actionHandler.handleAction(resData.action);
            }
        })
        .catch((error: AdyenCheckoutError) => {
            this.handleError(error);
        });
}
