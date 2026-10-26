import { h } from 'preact';
import { render } from '@testing-library/preact';
import DoFingerprint3DS2 from './DoFingerprint3DS2';

jest.mock('../../../internal/IFrame', () => ({
    __esModule: true,
    default: function MockIframe() {
        return null;
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
        const dispatchFingerPrintResultMessage = () => {
            window.dispatchEvent(
                new MessageEvent('message', {
                    origin: defaultProps.postMessageDomain,
                    data: JSON.stringify({ type: 'fingerPrintResult', threeDSCompInd: 'Y' })
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

            dispatchFingerPrintResultMessage();
            await flushPromiseChain();

            expect(defaultProps.onCompleteFingerprint).toHaveBeenCalledTimes(1);
        });

        test('should not call onCompleteFingerprint when the fingerPrintResult arrives after the root node was removed from the DOM without going through Preact\'s unmount lifecycle (e.g. a merchant doing el.innerHTML = "")', async () => {
            const { container } = render(<DoFingerprint3DS2 {...defaultProps} />);

            // Detach without going through Preact's unmount lifecycle - componentWillUnmount never runs.
            // eslint-disable-next-line testing-library/no-container -- intentionally need raw DOM access to simulate a non-Preact-mediated removal
            container.remove();

            dispatchFingerPrintResultMessage();
            await flushPromiseChain();

            expect(defaultProps.onCompleteFingerprint).not.toHaveBeenCalled();
        });
    });
});
