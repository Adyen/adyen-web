import Script from './Script';
import AdyenCheckoutError from '../core/Errors/AdyenCheckoutError';
import { mock } from 'jest-mock-extended';
import { AnalyticsModule } from '../types/global-types';

const SCRIPT_SRC = 'https://example.com/script.js';
const mockAnalytics = mock<AnalyticsModule>();

describe('Script', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });

    test('should add script with specified data attributes', async () => {
        const scriptElement = document.createElement('script');
        jest.spyOn(document, 'createElement').mockImplementation(() => scriptElement);

        const dataAttributes = { clientToken: 'xxx-yyy', cspNonce: 'nonce-value' };
        const script = new Script({
            src: SCRIPT_SRC,
            component: 'example-sdk',
            dataAttributes,
            analytics: mockAnalytics
        });

        const loadPromise = script.load();

        // Simulate 'load' event by dispatching it
        const loadEvent = new Event('load');
        scriptElement.dispatchEvent(loadEvent);

        expect(scriptElement.dataset['clientToken']).toBe('xxx-yyy');
        expect(scriptElement.dataset['cspNonce']).toBe('nonce-value');
        expect(scriptElement.src).toBe(SCRIPT_SRC);

        await expect(loadPromise).resolves.toBeUndefined();
    });

    test('should resolve immediately if the script is already loaded', async () => {
        // Setup: A script with the same src already exists and is marked as loaded
        const existingScript = document.createElement('script');
        existingScript.src = SCRIPT_SRC;
        existingScript.setAttribute('data-script-loaded', 'true');
        document.body.appendChild(existingScript);

        const createElementSpy = jest.spyOn(document, 'createElement');

        const script = new Script({
            src: SCRIPT_SRC,
            component: 'example-sdk',
            analytics: mockAnalytics
        });

        await expect(script.load()).resolves.toBeUndefined();
        expect(createElementSpy).not.toHaveBeenCalled();
    });

    test('should attach listeners if the script exists but is not yet loaded', async () => {
        // Setup: A script with the same src already exists but still loading
        const existingScript = document.createElement('script');
        existingScript.src = SCRIPT_SRC;
        document.body.appendChild(existingScript);

        const createElementSpy = jest.spyOn(document, 'createElement');
        const addListenerSpy = jest.spyOn(existingScript, 'addEventListener');

        const script = new Script({ src: SCRIPT_SRC, component: 'example-sdk', analytics: mockAnalytics });
        const loadPromise = script.load();

        // Assertions: The class should find the existing script and attach listeners to it.
        expect(createElementSpy).not.toHaveBeenCalled();
        expect(addListenerSpy).toHaveBeenCalledWith('load', expect.any(Function));
        expect(addListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));

        // To complete the test flow, we simulate the 'load' event and await the promise.
        const loadEvent = new Event('load');
        existingScript.dispatchEvent(loadEvent);

        await expect(loadPromise).resolves.toBeUndefined();
    });

    test('should succeed on the second attempt after one failure', async () => {
        jest.useFakeTimers();

        const firstAttemptScript = document.createElement('script');
        const secondAttemptScript = document.createElement('script');

        jest.spyOn(document, 'createElement')
            .mockImplementationOnce(() => firstAttemptScript)
            .mockImplementationOnce(() => secondAttemptScript);

        const script = new Script({ src: SCRIPT_SRC, component: 'example-sdk', analytics: mockAnalytics });
        const loadPromise = script.load();

        // Trigger the 'error' event on the first loading attempt
        const errorEvent = new Event('error');
        firstAttemptScript.dispatchEvent(errorEvent);

        // Advance time to trigger the retry
        await jest.advanceTimersByTimeAsync(Script.RETRY_DELAY);

        // Trigger the 'load' event on the second loading attempt
        const loadEvent = new Event('load');
        secondAttemptScript.dispatchEvent(loadEvent);

        await expect(loadPromise).resolves.toBeUndefined();
        jest.useRealTimers();
    });

    test('should thrown an error if all retries fail', async () => {
        jest.useFakeTimers();

        const firstAttemptScript = document.createElement('script');
        const secondAttemptScript = document.createElement('script');
        const thirdAttemptScript = document.createElement('script');

        jest.spyOn(document, 'createElement')
            .mockImplementationOnce(() => firstAttemptScript)
            .mockImplementationOnce(() => secondAttemptScript)
            .mockImplementationOnce(() => thirdAttemptScript);

        const script = new Script({ src: SCRIPT_SRC, component: 'example-sdk', analytics: mockAnalytics });
        const loadPromise = script.load();

        // Trigger the 'error' event on the first loading attempt
        const errorEvent = new Event('error');
        firstAttemptScript.dispatchEvent(errorEvent);

        // Advance time to trigger the retry
        await jest.advanceTimersByTimeAsync(Script.RETRY_DELAY);

        // Trigger the 'error' event on the second loading attempt
        secondAttemptScript.dispatchEvent(errorEvent);

        // Advance time to trigger the retry
        await jest.advanceTimersByTimeAsync(Script.RETRY_DELAY);

        // Trigger the 'error' event on the third loading attempt
        thirdAttemptScript.dispatchEvent(errorEvent);

        await expect(loadPromise).rejects.toBeInstanceOf(AdyenCheckoutError);
        expect(document.body.querySelector(`script[src="${SCRIPT_SRC}"]`)).toBeNull();

        jest.useRealTimers();
    });

    test('should remove script and allow reloading when using remove()', async () => {
        const scriptElement = document.createElement('script');
        const createElementSpy = jest.spyOn(document, 'createElement').mockImplementationOnce(() => scriptElement);

        const script = new Script({ src: SCRIPT_SRC, component: 'example-sdk', analytics: mockAnalytics });
        const loadPromise = script.load();

        // Simulate 'load' event by dispatching it
        const loadEvent = new Event('load');
        scriptElement.dispatchEvent(loadEvent);

        // Loads successfully
        await expect(loadPromise).resolves.toBeUndefined();
        expect(createElementSpy).toHaveBeenCalledTimes(1);
        expect(document.body.querySelector(`script[src="${SCRIPT_SRC}"]`)).not.toBeNull();

        // Remove script
        script.remove();
        expect(document.body.querySelector(`script[src="${SCRIPT_SRC}"]`)).toBeNull();

        // Load again and expect it to create a new script
        void script.load();
        expect(createElementSpy).toHaveBeenCalledTimes(2);
    });

    test('should not load if script container is not found', async () => {
        jest.spyOn(document, 'querySelector').mockReturnValue(null);
        const createElementSpy = jest.spyOn(document, 'createElement');

        const script = new Script({ src: SCRIPT_SRC, node: '#non-existent-node', component: 'example-sdk', analytics: mockAnalytics });
        const loadPromise = script.load();

        await expect(loadPromise).rejects.toThrow('Unable to find script container node: #non-existent-node');
        expect(createElementSpy).not.toHaveBeenCalled();
    });

    test('should reject a pending promise when remove() is called', async () => {
        const script = new Script({ src: SCRIPT_SRC, component: 'example-sdk', analytics: mockAnalytics });
        const loadPromise = script.load();

        script.remove();

        // A promise deve ser rejeitada com o erro de cancelamento
        await expect(loadPromise).rejects.toThrow(new AdyenCheckoutError('CANCEL', 'Script loading cancelled.'));
        expect(document.body.querySelector(`script[src="${SCRIPT_SRC}"]`)).toBeNull();
    });
});
