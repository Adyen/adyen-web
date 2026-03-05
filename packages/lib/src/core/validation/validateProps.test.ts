import { validateCoreConfiguration, validateUIElementProps } from './validateProps';

const originalNodeEnv = process.env.NODE_ENV;
let warnSpy: jest.SpyInstance;

beforeEach(() => {
    process.env.NODE_ENV = 'development';
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    warnSpy.mockRestore();
});

describe('validateCoreConfiguration', () => {
    it('should not warn for a valid configuration', () => {
        validateCoreConfiguration({
            clientKey: 'test_123',
            environment: 'test',
            showPayButton: true,
            locale: 'en-US',
            countryCode: 'NL',
            amount: { value: 1000, currency: 'EUR' }
        });

        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('should not warn when all optional props are omitted', () => {
        validateCoreConfiguration({});
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('should warn for invalid environment value', () => {
        validateCoreConfiguration({
            environment: 'staging' as any
        });

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('environment'));
    });

    it('should warn for wrong type on a known prop', () => {
        validateCoreConfiguration({
            showPayButton: 'yes' as any
        });

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('showPayButton'));
    });

    it('should warn for unknown props', () => {
        validateCoreConfiguration({
            foo: 'bar'
        } as any);

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('foo'));
    });

    it('should warn for multiple unknown props', () => {
        validateCoreConfiguration({
            foo: 'bar',
            baz: 123
        } as any);

        expect(warnSpy).toHaveBeenCalled();
        const allWarnings = warnSpy.mock.calls.map(c => c[0]).join(' ');
        expect(allWarnings).toContain('foo');
        expect(allWarnings).toContain('baz');
    });

    it('should warn for invalid amount shape', () => {
        validateCoreConfiguration({
            amount: { value: 'not-a-number' } as any
        });

        expect(warnSpy).toHaveBeenCalled();
    });

    it('should warn for invalid session shape', () => {
        validateCoreConfiguration({
            session: { wrongKey: 'value' } as any
        });

        expect(warnSpy).toHaveBeenCalled();
    });

    it('should not warn for valid callbacks', () => {
        validateCoreConfiguration({
            onSubmit: () => {},
            onError: () => {},
            onChange: () => {},
            beforeSubmit: () => {},
            onPaymentCompleted: () => {}
        });

        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('should warn when callback is not a function', () => {
        validateCoreConfiguration({
            onSubmit: 'not-a-function' as any
        });

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('onSubmit'));
    });

    it('should not warn for valid _environmentUrls', () => {
        validateCoreConfiguration({
            _environmentUrls: {
                api: 'https://custom-api.example.com',
                cdn: {
                    images: 'https://images.example.com'
                }
            }
        });

        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('should not warn for valid analytics config', () => {
        validateCoreConfiguration({
            analytics: {
                enabled: true,
                analyticsData: {
                    checkoutAttemptId: 'abc-123'
                }
            }
        });

        expect(warnSpy).not.toHaveBeenCalled();
    });
});

describe('validateUIElementProps', () => {
    it('should not warn for valid UIElement props', () => {
        validateUIElementProps({
            type: 'card',
            showPayButton: true,
            amount: { value: 1000, currency: 'EUR' }
        });

        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('should not warn for empty props', () => {
        validateUIElementProps({});
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('should warn for wrong type on showPayButton', () => {
        validateUIElementProps({
            showPayButton: 'true' as any
        });

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('showPayButton'));
    });

    it('should not warn for valid callbacks', () => {
        validateUIElementProps({
            onSubmit: () => {},
            onChange: () => {},
            onError: () => {}
        });

        expect(warnSpy).not.toHaveBeenCalled();
    });

    it('should warn for invalid amount shape', () => {
        validateUIElementProps({
            amount: { value: 'wrong' } as any
        });

        expect(warnSpy).toHaveBeenCalled();
    });

    it('should not warn for unknown props (UIElement uses catchall)', () => {
        validateUIElementProps({
            customProp: 'some-value'
        } as any);

        expect(warnSpy).not.toHaveBeenCalled();
    });
});
