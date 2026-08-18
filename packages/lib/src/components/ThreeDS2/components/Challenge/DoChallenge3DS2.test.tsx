import { h } from 'preact';
import { render } from '@testing-library/preact';
import DoChallenge3DS2 from './DoChallenge3DS2';
import { PASSKEY_3DS2_IFRAME_ALLOW, PASSKEY_VISA_IFRAME_ALLOW, PASSKEY_VISA_IFRAME_SANDBOX } from '../../constants';

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
});
