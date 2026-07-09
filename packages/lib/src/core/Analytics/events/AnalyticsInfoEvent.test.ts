import { AnalyticsInfoEvent, InfoEventType } from './AnalyticsInfoEvent';
import { AnalyticsEventCategory } from './AbstractAnalyticsEvent';

describe('AnalyticsInfoEvent', () => {
    test('should be categorized as an info event', () => {
        const event = new AnalyticsInfoEvent({ type: InfoEventType.rendered, component: 'scheme' });
        expect(event.getEventCategory()).toBe(AnalyticsEventCategory.info);
    });

    describe('configData transformation', () => {
        test('should mask sensitive fields with <masked>', () => {
            const event = new AnalyticsInfoEvent({
                type: InfoEventType.Initialized,
                component: 'checkout',
                configData: {
                    clientKey: 'test_ABC123XYZ789DEF456',
                    session: { id: 'CS1234567890ABCDEF', sessionData: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' },
                    paymentMethodsResponse: { paymentMethods: [{ type: 'scheme' }] },
                    translations: { 'en-US': { pay: 'Pay!' } }
                }
            });

            expect(event).toEqual(
                expect.objectContaining({
                    configData: {
                        clientKey: '<masked>',
                        session: '<masked>',
                        paymentMethodsResponse: '<masked>',
                        translations: '<masked>'
                    }
                })
            );
        });

        test('should replace functions with <function>', () => {
            const event = new AnalyticsInfoEvent({
                type: InfoEventType.Initialized,
                component: 'checkout',
                configData: {
                    onSubmit: () => true,
                    onPaymentCompleted: function () {
                        return true;
                    }
                }
            });

            expect(event).toEqual(
                expect.objectContaining({
                    configData: {
                        onSubmit: '<function>',
                        onPaymentCompleted: '<function>'
                    }
                })
            );
        });

        test('should stringify objects and cap them at 128 characters', () => {
            const longObject = { data: 'a'.repeat(200) };

            const event = new AnalyticsInfoEvent({
                type: InfoEventType.Initialized,
                component: 'checkout',
                configData: {
                    amount: { value: 1000, currency: 'USD' },
                    risk: { enabled: false },
                    longObject
                }
            }) as any;

            expect(event.configData.amount).toBe('{"value":1000,"currency":"USD"}');
            expect(event.configData.risk).toBe('{"enabled":false}');
            expect(event.configData.longObject.length).toBe(128);
        });

        test('should join arrays into a comma-separated string capped at 128 characters', () => {
            const event = new AnalyticsInfoEvent({
                type: InfoEventType.Initialized,
                component: 'checkout',
                configData: {
                    allowPaymentMethods: ['scheme', 'paypal', 'googlepay']
                }
            }) as any;

            expect(event.configData.allowPaymentMethods).toBe('scheme, paypal, googlepay');
        });

        test('should keep primitive values as-is', () => {
            const event = new AnalyticsInfoEvent({
                type: InfoEventType.Initialized,
                component: 'checkout',
                configData: {
                    environment: 'test',
                    locale: 'en-US',
                    countryCode: 'US',
                    showPayButton: true
                }
            }) as any;

            expect(event.configData).toEqual({
                environment: 'test',
                locale: 'en-US',
                countryCode: 'US',
                showPayButton: true
            });
        });

        test('should not include configData when none is provided', () => {
            const event = new AnalyticsInfoEvent({ type: InfoEventType.Initialized, component: 'fastlane' }) as any;
            expect(event.configData).toBeUndefined();
        });

        test('should process configData for rendered events', () => {
            const event = new AnalyticsInfoEvent({
                type: InfoEventType.rendered,
                component: 'scheme',
                configData: { showPayButton: true, onChange: () => true }
            }) as any;

            expect(event.configData).toEqual({ showPayButton: true, onChange: '<function>' });
        });
    });
});
