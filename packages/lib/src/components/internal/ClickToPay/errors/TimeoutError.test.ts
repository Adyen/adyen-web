import TimeoutError from './TimeoutError';

describe('Click to Pay: TimeoutError', () => {
    test('should return proper error message', () => {
        const error = new TimeoutError({ source: 'identityLookup', scheme: 'visa', isTimeoutTriggeredBySchemeSdk: true });

        expect(error.message).toBe("ClickToPayService - Timeout during identityLookup() of the scheme 'visa'");
        expect(error.isTimeoutTriggeredBySchemeSdk).toBeTruthy();
        expect(error.correlationId).toBeUndefined();
        expect(error.source).toBe('identityLookup');
    });

    test('should be able to set the correlationId as part of the error', () => {
        const error = new TimeoutError({ source: 'init', scheme: 'mc', isTimeoutTriggeredBySchemeSdk: false });
        error.setCorrelationId('xxx-yyy');

        expect(error.message).toBe("ClickToPayService - Timeout during init() of the scheme 'mc'");
        expect(error.isTimeoutTriggeredBySchemeSdk).toBeFalsy();
        expect(error.source).toBe('init');
        expect(error.correlationId).toBe('xxx-yyy');
    });
});
