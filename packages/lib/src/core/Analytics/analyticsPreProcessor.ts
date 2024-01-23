import { AnalyticsModule } from '../../components/types';
import { CreateAnalyticsEventObject, SendAnalyticsObject } from './types';
import {
    ANALYTICS_ACTION_STR,
    ANALYTICS_FOCUS_STR,
    ANALYTICS_RENDERED_STR,
    ANALYTICS_SELECTED_STR,
    ANALYTICS_SUBMIT_STR,
    ANALYTICS_UNFOCUS_STR,
    ANALYTICS_VALIDATION_ERROR_STR
} from './constants';
import { THREEDS2_ERROR, THREEDS2_FULL } from '../../components/ThreeDS2/config';

export const analyticsPreProcessor = (analyticsModule: AnalyticsModule) => {
    // return function with an analyticsModule reference
    return (component: string, analyticsObj: SendAnalyticsObject) => {
        const { type, target } = analyticsObj;

        switch (type) {
            // Called from BaseElement (when component mounted) or, from DropinComponent (after mounting, when it has finished resolving all the PM promises)
            // &/or, from DropinComponent when a PM is selected
            case ANALYTICS_RENDERED_STR: {
                const { isStoredPaymentMethod, brand } = analyticsObj;
                const data = { component, type, isStoredPaymentMethod, brand };

                analyticsModule.createAnalyticsEvent({
                    event: 'info',
                    data
                });
                break;
            }

            case ANALYTICS_SUBMIT_STR:
                analyticsModule.createAnalyticsEvent({
                    event: 'log',
                    data: { component, type, target: 'pay_button', message: 'Shopper clicked pay' }
                });
                break;

            case ANALYTICS_ACTION_STR: {
                const { subtype, message } = analyticsObj;
                analyticsModule.createAnalyticsEvent({
                    event: 'log',
                    data: { component, type, subtype, message }
                });
                break;
            }

            case ANALYTICS_FOCUS_STR:
            case ANALYTICS_UNFOCUS_STR:
                analyticsModule.createAnalyticsEvent({
                    event: 'info',
                    data: { component, type, target }
                });
                break;

            case ANALYTICS_VALIDATION_ERROR_STR: {
                const { validationErrorCode, validationErrorMessage } = analyticsObj;
                analyticsModule.createAnalyticsEvent({
                    event: 'info',
                    data: { component, type, target, validationErrorCode, validationErrorMessage }
                });
                break;
            }

            case ANALYTICS_SELECTED_STR:
                analyticsModule.createAnalyticsEvent({
                    event: 'info',
                    data: { component, type, target }
                });
                break;

            case THREEDS2_FULL: {
                const { message } = analyticsObj;
                analyticsModule.createAnalyticsEvent({
                    event: 'log',
                    data: { component, type, message }
                });
                break;
            }

            case THREEDS2_ERROR: {
                const { message, code, errorType } = analyticsObj;
                analyticsModule.createAnalyticsEvent({
                    event: 'error',
                    data: { component, type, message, code, errorType }
                });
                break;
            }

            default: {
                analyticsModule.createAnalyticsEvent(analyticsObj as CreateAnalyticsEventObject);
            }
        }
    };
};
