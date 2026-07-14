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

        test('should mask PII fields with <masked>', () => {
            const event = new AnalyticsInfoEvent({
                type: InfoEventType.Initialized,
                component: 'checkout',
                configData: {
                    data: { name: 'John Doe' },
                    holderName: 'John Doe',
                    shopperEmail: 'john.doe@example.com',
                    email: 'jane.doe@example.com',
                    telephoneNumber: '+31612345678',
                    clickToPayConfiguration: { shopperEmail: 'john.doe@example.com', telephoneNumber: '+31612345678' }
                }
            });

            expect(event['configData']).toEqual({
                data: '<masked>',
                holderName: '<masked>',
                shopperEmail: '<masked>',
                email: '<masked>',
                telephoneNumber: '<masked>',
                clickToPayConfiguration: '<masked>'
            });
        });

        test('should not leak PII values into the configData payload', () => {
            const event = new AnalyticsInfoEvent({
                type: InfoEventType.Initialized,
                component: 'checkout',
                configData: {
                    holderName: 'John Doe',
                    shopperEmail: 'john.doe@example.com',
                    telephoneNumber: '+31612345678',
                    data: { name: 'John Doe' }
                }
            });

            const serialized = JSON.stringify(event['configData']);
            expect(serialized).not.toContain('John Doe');
            expect(serialized).not.toContain('john.doe@example.com');
            expect(serialized).not.toContain('+31612345678');
            expect(serialized).not.toContain('4111111111111111');
            expect(serialized).not.toContain('737');
        });

        test('should mask PII fields regardless of their type (primitive, function, array, object)', () => {
            const event = new AnalyticsInfoEvent({
                type: InfoEventType.Initialized,
                component: 'checkout',
                configData: {
                    holderName: 'John Doe',
                    email: () => 'jane.doe@example.com',
                    data: ['4111111111111111', '737']
                }
            });

            expect(event['configData']).toEqual({
                holderName: '<masked>',
                email: '<masked>',
                data: '<masked>'
            });
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
            });

            expect(event['configData']?.amount).toBe('{"value":1000,"currency":"USD"}');
            expect(event['configData']?.risk).toBe('{"enabled":false}');
            expect((event['configData']?.longObject as string).length).toBe(128);
        });

        test('should join arrays into a comma-separated string capped at 128 characters', () => {
            const event = new AnalyticsInfoEvent({
                type: InfoEventType.Initialized,
                component: 'checkout',
                configData: {
                    allowPaymentMethods: ['scheme', 'paypal', 'googlepay']
                }
            });

            expect(event['configData']?.allowPaymentMethods).toBe('scheme, paypal, googlepay');
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
            });

            expect(event['configData']).toEqual({
                environment: 'test',
                locale: 'en-US',
                countryCode: 'US',
                showPayButton: true
            });
        });

        test('should not include configData when none is provided', () => {
            const event = new AnalyticsInfoEvent({ type: InfoEventType.Initialized, component: 'fastlane' });
            expect(event['configData']).toBeUndefined();
        });

        test('should process configData for rendered events', () => {
            const event = new AnalyticsInfoEvent({
                type: InfoEventType.rendered,
                component: 'scheme',
                configData: { showPayButton: true, onChange: () => true }
            });

            expect(event['configData']).toEqual({ showPayButton: true, onChange: '<function>' });
        });
    });
});
