import { h } from 'preact';
import { render } from '@testing-library/preact';
import DoFingerprint3DS2 from './DoFingerprint3DS2';
import { THREEDS_METHOD_TIMEOUT, FAILED_METHOD_STATUS_RESOLVE_OBJECT_TIMEOUT } from '../../constants';

// Rendered <iframe> elements, in render order - lets tests post messages from a specific instance's iframe
let mockIframeEls: HTMLIFrameElement[] = [];

jest.mock('../../../internal/IFrame', () => ({
    __esModule: true,
    default: function MockIframe(props: Record<string, any>) {
        // Render a real <iframe> so the component can resolve its own contentWindow as the expected postMessage source
        return (
            <iframe
                name={props.name}
                title="mock 3DS2 iframe"
                ref={el => {
                    if (el) mockIframeEls.push(el);
                }}
            />
        );
    }
}));

const defaultProps = {
    threeDSServerTransID: '3fc4ead',
    threeDSMethodURL: 'https://pal-test.adyen.com/threeds2simulator/acs/fingerprint.shtml',
    threeDSMethodNotificationURL: 'https://checkoutshopper-test.adyen.com/checkoutshopper/3ds2in1/notificationURL.shtml',
    postMessageDomain: 'https://checkoutshopper-test.adyen.com',
    showSpinner: true,
    onCompleteFingerprint: jest.fn(),
    onErrorFingerprint: jest.fn(),
    onActionHandled: jest.fn(),
    onFormSubmit: jest.fn()
};

describe('DoFingerprint3DS2', () => {
    describe('Handling the fingerPrintResult postMessage after the component has been torn down outside of Preact', () => {
        const lastIframeWindow = (): Window => mockIframeEls[mockIframeEls.length - 1].contentWindow;

        const dispatchFingerPrintResultMessage = (source: MessageEventSource | null) => {
            window.dispatchEvent(
                new MessageEvent('message', {
                    origin: defaultProps.postMessageDomain,
                    data: JSON.stringify({ type: 'fingerPrintResult', threeDSCompInd: 'Y' }),
                    source
                })
            );
        };

        // Resolving goes through promiseTimeout's own .then() before DoFingerprint3DS2's .then() runs, so
        // allow a macrotask tick for both hops of the promise chain to flush before asserting.
        const flushPromiseChain = () => new Promise(resolve => setTimeout(resolve, 0));

        beforeEach(() => {
            defaultProps.onCompleteFingerprint.mockClear();
            defaultProps.onErrorFingerprint.mockClear();
        });

        test('should call onCompleteFingerprint when the fingerPrintResult arrives while still mounted', async () => {
            render(<DoFingerprint3DS2 {...defaultProps} />);

            dispatchFingerPrintResultMessage(lastIframeWindow());
            await flushPromiseChain();

            expect(defaultProps.onCompleteFingerprint).toHaveBeenCalledTimes(1);
        });

        test('should ignore a fingerPrintResult from the expected domain that was posted by a different window', async () => {
            mockIframeEls = [];
            render(<DoFingerprint3DS2 {...defaultProps} />);
            render(<DoFingerprint3DS2 {...defaultProps} onCompleteFingerprint={jest.fn()} />);
            const [ownIframe, siblingIframe] = mockIframeEls;

            dispatchFingerPrintResultMessage(siblingIframe.contentWindow);
            dispatchFingerPrintResultMessage(window);
            await flushPromiseChain();

            expect(defaultProps.onCompleteFingerprint).not.toHaveBeenCalled();
            expect(ownIframe.isConnected).toBe(true);
        });

        test('should not call onCompleteFingerprint when the fingerPrintResult arrives after the root node was removed from the DOM without going through Preact\'s unmount lifecycle (e.g. a merchant doing el.innerHTML = "")', async () => {
            const { container } = render(<DoFingerprint3DS2 {...defaultProps} />);
            const ownIframeWindow = lastIframeWindow();

            // Detach without going through Preact's unmount lifecycle - componentWillUnmount never runs.
            // eslint-disable-next-line testing-library/no-container -- intentionally need raw DOM access to simulate a non-Preact-mediated removal
            container.remove();

            dispatchFingerPrintResultMessage(ownIframeWindow);
            await flushPromiseChain();

            expect(defaultProps.onCompleteFingerprint).not.toHaveBeenCalled();
        });
    });

    describe('Handling a fingerprint timeout after the component has been torn down outside of Preact', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            defaultProps.onCompleteFingerprint.mockClear();
            defaultProps.onErrorFingerprint.mockClear();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        test('should call onErrorFingerprint when the fingerprint times out while still mounted', async () => {
            render(<DoFingerprint3DS2 {...defaultProps} />);

            await jest.advanceTimersByTimeAsync(THREEDS_METHOD_TIMEOUT);

            expect(defaultProps.onErrorFingerprint).toHaveBeenCalledTimes(1);
            expect(defaultProps.onErrorFingerprint).toHaveBeenCalledWith(FAILED_METHOD_STATUS_RESOLVE_OBJECT_TIMEOUT);
        });

        test('should not call onErrorFingerprint when the fingerprint times out after the root node was removed from the DOM without going through Preact\'s unmount lifecycle (e.g. a merchant doing el.innerHTML = "")', async () => {
            const { container } = render(<DoFingerprint3DS2 {...defaultProps} />);

            // Detach without going through Preact's unmount lifecycle - componentWillUnmount never runs.
            // eslint-disable-next-line testing-library/no-container -- intentionally need raw DOM access to simulate a non-Preact-mediated removal
            container.remove();

            await jest.advanceTimersByTimeAsync(THREEDS_METHOD_TIMEOUT);

            expect(defaultProps.onErrorFingerprint).not.toHaveBeenCalled();
        });
    });
});
