import { h } from 'preact';
import { render } from '@testing-library/preact';
import DoChallenge3DS2 from './DoChallenge3DS2';
import {
    CHALLENGE_TIMEOUT,
    CHALLENGE_TIMEOUT_REJECT_OBJECT,
    PASSKEY_3DS2_IFRAME_ALLOW,
    PASSKEY_VISA_IFRAME_ALLOW,
    PASSKEY_VISA_IFRAME_SANDBOX
} from '../../constants';

let mockIframeProps: any = {};

jest.mock('../../../internal/IFrame', () => ({
    __esModule: true,
    default: function MockIframe(props: Record<string, unknown>) {
        mockIframeProps = props;
        return null;
    }
}));

const defaultProps = {
    acsURL: 'https://pal-test.adyen.com/threeds2simulator/acs/challenge.shtml',
    cReqData: {
        acsTransID: '4bc7960d',
        messageVersion: '2.1.0',
        threeDSServerTransID: '3fc4ead',
        messageType: 'CReq',
        challengeWindowSize: '02'
    },
    iframeSizeArr: ['390px', '400px'],
    postMessageDomain: 'https://checkoutshopper-test.adyen.com',
    onCompleteChallenge: jest.fn(),
    onErrorChallenge: jest.fn(),
    onActionHandled: jest.fn(),
    onFormSubmit: jest.fn()
};

describe('DoChallenge3DS2', () => {
    describe('Passkey iframe attributes', () => {
        beforeEach(() => {
            mockIframeProps = {};
        });

        test('should set default allow attribute and no sandbox when usePasskeyIFrameAttributes is not set', () => {
            render(<DoChallenge3DS2 {...defaultProps} />);

            expect(mockIframeProps.allow).toBe(PASSKEY_3DS2_IFRAME_ALLOW);
            expect(mockIframeProps.sandbox).toBeUndefined();
        });

        test('should set default allow attribute and no sandbox when usePasskeyIFrameAttributes is false', () => {
            render(<DoChallenge3DS2 {...defaultProps} usePasskeyIFrameAttributes={false} />);

            expect(mockIframeProps.allow).toBe(PASSKEY_3DS2_IFRAME_ALLOW);
            expect(mockIframeProps.sandbox).toBeUndefined();
        });

        test('should set Visa passkey allow and sandbox attributes when usePasskeyIFrameAttributes is true', () => {
            render(<DoChallenge3DS2 {...defaultProps} usePasskeyIFrameAttributes={true} />);

            expect(mockIframeProps.allow).toBe(PASSKEY_VISA_IFRAME_ALLOW);
            expect(mockIframeProps.sandbox).toBe(PASSKEY_VISA_IFRAME_SANDBOX);
        });
    });

    describe('Handling the challengeResult postMessage after the component has been torn down outside of Preact', () => {
        const dispatchChallengeResultMessage = () => {
            window.dispatchEvent(
                new MessageEvent('message', {
                    origin: defaultProps.postMessageDomain,
                    data: JSON.stringify({ type: 'challengeResult', transStatus: 'Y' })
                })
            );
        };

        beforeEach(() => {
            defaultProps.onCompleteChallenge.mockClear();
            defaultProps.onErrorChallenge.mockClear();
        });

        // Resolving goes through promiseTimeout's own .then() before DoChallenge3DS2's .then() runs, so
        // allow a macrotask tick for both hops of the promise chain to flush before asserting.
        const flushPromiseChain = () => new Promise(resolve => setTimeout(resolve, 0));

        test('should call onCompleteChallenge when the challengeResult arrives while still mounted', async () => {
            render(<DoChallenge3DS2 {...defaultProps} />);

            dispatchChallengeResultMessage();
            await flushPromiseChain();

            expect(defaultProps.onCompleteChallenge).toHaveBeenCalledTimes(1);
        });

        test('should not call onCompleteChallenge when the challengeResult arrives after the root node was removed from the DOM without going through Preact\'s unmount lifecycle (e.g. a merchant doing el.innerHTML = "")', async () => {
            const { container } = render(<DoChallenge3DS2 {...defaultProps} />);

            // Detach without going through Preact's unmount lifecycle - componentWillUnmount never runs.
            // eslint-disable-next-line testing-library/no-container -- intentionally need raw DOM access to simulate a non-Preact-mediated removal
            container.remove();

            dispatchChallengeResultMessage();
            await flushPromiseChain();

            expect(defaultProps.onCompleteChallenge).not.toHaveBeenCalled();
        });
    });

    describe('Handling a challenge timeout after the component has been torn down outside of Preact', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            defaultProps.onCompleteChallenge.mockClear();
            defaultProps.onErrorChallenge.mockClear();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        test('should call onErrorChallenge when the challenge times out while still mounted', async () => {
            render(<DoChallenge3DS2 {...defaultProps} />);

            await jest.advanceTimersByTimeAsync(CHALLENGE_TIMEOUT);

            expect(defaultProps.onErrorChallenge).toHaveBeenCalledTimes(1);
            expect(defaultProps.onErrorChallenge).toHaveBeenCalledWith(CHALLENGE_TIMEOUT_REJECT_OBJECT);
        });

        test('should not call onErrorChallenge when the challenge times out after the root node was removed from the DOM without going through Preact\'s unmount lifecycle (e.g. a merchant doing el.innerHTML = "")', async () => {
            const { container } = render(<DoChallenge3DS2 {...defaultProps} />);

            // Detach without going through Preact's unmount lifecycle - componentWillUnmount never runs.
            // eslint-disable-next-line testing-library/no-container -- intentionally need raw DOM access to simulate a non-Preact-mediated removal
            container.remove();

            await jest.advanceTimersByTimeAsync(CHALLENGE_TIMEOUT);

            expect(defaultProps.onErrorChallenge).not.toHaveBeenCalled();
        });
    });
});
