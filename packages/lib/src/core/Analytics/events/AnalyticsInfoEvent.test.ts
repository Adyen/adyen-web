import { AnalyticsInfoEvent, InfoEventType, UiTarget } from './AnalyticsInfoEvent';
import { ERROR_FIELD_REQUIRED } from '../../Errors/constants';

describe('AnalyticsInfoEvent', () => {
    describe('validation error codes', () => {
        test('should map a generic validation error code using the target', () => {
            const event = new AnalyticsInfoEvent({
                type: InfoEventType.validationError,
                component: 'card',
                target: 'postal_code' as UiTarget,
                validationErrorCode: ERROR_FIELD_REQUIRED
            });

            expect(event).toHaveProperty('validationErrorCode', '933');
        });

        test('should keep a generic validation error code when there is no target', () => {
            const event = new AnalyticsInfoEvent({
                type: InfoEventType.validationError,
                component: 'card',
                validationErrorCode: ERROR_FIELD_REQUIRED
            });

            expect(event).toHaveProperty('validationErrorCode', ERROR_FIELD_REQUIRED);
        });

        test('should not set a validation error code when none is provided', () => {
            const event = new AnalyticsInfoEvent({
                type: InfoEventType.validationError,
                component: 'card',
                target: UiTarget.cardNumber
            });

            expect(event['validationErrorCode']).toBeUndefined();
        });

        test('should not map the validation error code for non validation events', () => {
            const event = new AnalyticsInfoEvent({
                type: InfoEventType.focus,
                component: 'card',
                target: 'postal_code' as UiTarget,
                validationErrorCode: ERROR_FIELD_REQUIRED
            });

            expect(event).toHaveProperty('validationErrorCode', ERROR_FIELD_REQUIRED);
        });
    });
});
