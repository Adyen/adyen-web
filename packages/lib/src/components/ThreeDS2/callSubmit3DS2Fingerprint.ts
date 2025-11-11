import { httpPost } from '../../core/Services/http';
import { pick } from '../../utils/commonUtils';
import { ThreeDS2FingerprintResponse } from './types';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { THREEDS2_FINGERPRINT_SUBMIT } from './constants';
import { API_ERROR_CODE } from '../../core/Services/sessions/constants';
import { AbstractAnalyticsEvent } from '../../core/Analytics/events/AbstractAnalyticsEvent';
import { AnalyticsErrorEvent, ErrorEventCode, ErrorEventType } from '../../core/Analytics/events/AnalyticsErrorEvent';

/**
 * ThreeDS2DeviceFingerprint, onComplete, calls a new, internal, endpoint which
 * behaves like the /details endpoint but doesn't require the same credentials
 */
export default function callSubmit3DS2Fingerprint({ data }): void {
    console.log('callSubmit3DS2Fingerprint', data);

    httpPost<ThreeDS2FingerprintResponse>(
        {
            path: `v1/submitThreeDS2Fingerprint?token=${this.props.clientKey}`,
            loadingContext: this.props.loadingContext,
            errorLevel: 'fatal',
            errorCode: API_ERROR_CODE.submitThreeDS2Fingerprint
        },
        {
            ...data
        }
    )
        .then(resData => {
            let event: AbstractAnalyticsEvent;

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

                    event = new AnalyticsErrorEvent({
                        component: 'threeDS2Fingerprint',
                        code: ErrorEventCode.THREEDS2_NO_DETAILS_FOR_FRICTIONLESS_OR_REFUSED,
                        errorType: ErrorEventType.apiError,
                        message: `${THREEDS2_FINGERPRINT_SUBMIT}: no details object in a response indicating either a "frictionless" flow, or a "refused" response`
                    });

                    this.submitAnalytics(event);

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

                event = new AnalyticsErrorEvent({
                    component: 'threeDS2Fingerprint',
                    code: ErrorEventCode.THREEDS2_NO_ACTION_FOR_CHALLENGE,
                    errorType: ErrorEventType.apiError,
                    message: `${THREEDS2_FINGERPRINT_SUBMIT}: no action object in a response indicating a "challenge" flow`
                });
                this.submitAnalytics(event);

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

                event = new AnalyticsErrorEvent({
                    component: 'threeDS2Fingerprint',
                    code: ErrorEventCode.THREEDS2_NO_COMPONENT_FOR_ACTION,
                    errorType: ErrorEventType.sdkError,
                    message: `${THREEDS2_FINGERPRINT_SUBMIT}: no component defined to handle the action response`
                });

                this.submitAnalytics(event);

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
