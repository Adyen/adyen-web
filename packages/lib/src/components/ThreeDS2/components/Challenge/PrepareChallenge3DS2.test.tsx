import { h } from 'preact';
import { render, act } from '@testing-library/preact';
import PrepareChallenge3DS2 from './PrepareChallenge3DS2';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { THREEDS2_FULL, THREEDS2_CHALLENGE_ERROR, TIMEOUT } from '../../constants';
import { LogEventSubtype } from '../../../../core/Analytics/events/AnalyticsLogEvent';
import { ErrorEventCode, ErrorEventType } from '../../../../core/Analytics/events/AnalyticsErrorEvent';

const challengeToken = {
    acsReferenceNumber: 'ADYEN-ACS-SIMULATOR',
    acsTransID: '4bc7960d',
    acsURL: 'https://pal-test.adyen.com/threeds2simulator/acs/challenge.shtml',
    messageVersion: '2.1.0',
    threeDSNotificationURL: 'https://checkoutshopper-test.adyen.com/checkoutshopper/3dnotif.shtml',
    threeDSServerTransID: '3fc4ead'
};

let propsMaster: any;

const prepareProps = (token = challengeToken) => {
    const threeDS2ChallengeToken = JSON.stringify(token);

    propsMaster = {
        challengeWindowSize: '01',
        dataKey: 'threeDSResult',
        i18n: global.i18n,
        paymentData: 'Ab02b4c0!BQABAg',
        token: btoa(threeDS2ChallengeToken)
    };
};

let onError: any;
let errorMessage: string;

const baseAnalyticsError = {
    errorType: ErrorEventType.threeDS2,
    timestamp: expect.any(String),
    id: expect.any(String)
};

let onSubmitAnalytics: any;

const completeFunction = jest.fn();

let mockCallbacks: any = {};

jest.mock('./DoChallenge3DS2', () => ({
    __esModule: true,
    default: function MockDoChallenge(props) {
        mockCallbacks = {
            onCompleteChallenge: props.onCompleteChallenge,
            onErrorChallenge: props.onErrorChallenge
        };
        props.onFormSubmit?.('creq sent');
        return null;
    }
}));

const renderPrepareChallenge = props => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            {/*@ts-ignore Ignore typing on props*/}
            <PrepareChallenge3DS2 {...props} isMDFlow={false} onComplete={completeFunction} onSubmitAnalytics={onSubmitAnalytics} onError={onError} />
        </CoreProvider>
    );
};

describe('PrepareChallenge3DS2 - Happy flow', () => {
    beforeEach(() => {
        onError = jest.fn();
        onSubmitAnalytics = jest.fn();
        mockCallbacks = {};
    });

    test('should not throw an error when passing correct properties', () => {
        prepareProps();

        renderPrepareChallenge(propsMaster);

        expect(onError.mock.calls.length).toBe(0);

        expect(onSubmitAnalytics).toHaveBeenCalledWith({
            type: THREEDS2_FULL,
            message: 'creq sent',
            subType: LogEventSubtype.challengeDataSentWeb,
            timestamp: expect.any(String),
            id: expect.any(String)
        });
    });

    test('should fire completion analytics when challenge completes successfully', async () => {
        prepareProps();

        renderPrepareChallenge(propsMaster);

        await act(() => {
            mockCallbacks.onCompleteChallenge({ result: { transStatus: 'Y' } });
        });

        // analytics to say process is complete
        expect(onSubmitAnalytics).toHaveBeenCalledWith({
            type: THREEDS2_FULL,
            message: '3DS2 challenge has completed',
            subType: LogEventSubtype.challengeCompleted,
            result: 'success',
            timestamp: expect.any(String),
            id: expect.any(String)
        });

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(2);
    });
});

describe('PrepareChallenge3DS2 - flow completes with errors that are considered valid scenarios', () => {
    beforeEach(() => {
        onError = jest.fn();
        onSubmitAnalytics = jest.fn();
        mockCallbacks = {};
    });

    test('should fire timeout analytics when challenge times out', async () => {
        prepareProps();

        renderPrepareChallenge(propsMaster);

        await act(() => {
            mockCallbacks.onErrorChallenge({
                errorCode: 'timeout',
                result: { transStatus: 'U' }
            });
        });

        // analytics for error
        expect(onSubmitAnalytics).toHaveBeenCalledWith({
            message: 'threeDS2Challenge: timeout',
            code: ErrorEventCode.THREEDS2_TIMEOUT,
            errorType: ErrorEventType.threeDS2,
            timestamp: expect.any(String),
            id: expect.any(String)
        });

        // analytics to say process is complete
        expect(onSubmitAnalytics).toHaveBeenCalledWith({
            type: THREEDS2_FULL,
            message: '3DS2 challenge has completed',
            subType: LogEventSubtype.challengeCompleted,
            result: TIMEOUT,
            timestamp: expect.any(String),
            id: expect.any(String)
        });

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(3);
    });

    test('should fire no-transStatus analytics when there is no transStatus', async () => {
        prepareProps();

        renderPrepareChallenge(propsMaster);

        await act(() => {
            mockCallbacks.onCompleteChallenge({
                result: { errorCode: 'no trans status' }
            });
        });

        // analytics for error
        expect(onSubmitAnalytics).toHaveBeenCalledWith({
            message: `${THREEDS2_CHALLENGE_ERROR}: no transStatus could be retrieved`,
            code: ErrorEventCode.THREEDS2_NO_TRANSSTATUS,
            errorType: ErrorEventType.threeDS2,
            timestamp: expect.any(String),
            id: expect.any(String)
        });

        // analytics to say process is complete
        expect(onSubmitAnalytics).toHaveBeenCalledWith({
            type: THREEDS2_FULL,
            message: '3DS2 challenge has completed',
            subType: LogEventSubtype.challengeCompleted,
            result: 'noTransStatus',
            timestamp: expect.any(String),
            id: expect.any(String)
        });

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(3);
    });
});

describe('PrepareChallenge3DS2 - unhappy flows', () => {
    beforeEach(() => {
        errorMessage = null;

        onError = jest.fn(errObj => {
            errorMessage = errObj.message;
        });

        onSubmitAnalytics = jest.fn(() => {});
    });

    test('should call onError and onSubmitAnalytics when token is missing from props', () => {
        prepareProps();

        const propsMock = { ...propsMaster };
        delete propsMock.token;

        renderPrepareChallenge(propsMock);

        expect(errorMessage).toBe(`${ErrorEventCode.THREEDS2_ACTION_IS_MISSING_TOKEN}: Data parsing error`);

        const analyticsError = {
            ...baseAnalyticsError,
            code: ErrorEventCode.THREEDS2_ACTION_IS_MISSING_TOKEN,
            message: '3DS2Challenge_Error: Missing "token" property from threeDS2 action'
        };
        expect(onSubmitAnalytics).toHaveBeenCalledWith(analyticsError);

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(1);
    });

    test('should call onError and onSubmitAnalytics when token is not base64', () => {
        prepareProps();

        const propsMock = { ...propsMaster };
        propsMock.token = 'some string';

        renderPrepareChallenge(propsMock);

        expect(errorMessage).toBe(`${ErrorEventCode.THREEDS2_TOKEN_DECODE_OR_PARSING_FAILED}: Data parsing error`);

        const analyticsError = {
            ...baseAnalyticsError,
            code: ErrorEventCode.THREEDS2_TOKEN_DECODE_OR_PARSING_FAILED,
            message: '3DS2Challenge_Error: not base64'
        };
        expect(onSubmitAnalytics).toHaveBeenCalledWith(analyticsError);

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(1);
    });

    test('should call onError and onSubmitAnalytics when acsURL is not valid', () => {
        const alteredToken = { ...challengeToken };
        alteredToken.acsURL = '';

        prepareProps(alteredToken);

        const propsMock = { ...propsMaster };

        renderPrepareChallenge(propsMock);

        expect(errorMessage).toBe(`${ErrorEventCode.THREEDS2_TOKEN_IS_MISSING_ACSURL}: Data parsing error`);

        const analyticsError = {
            ...baseAnalyticsError,
            code: ErrorEventCode.THREEDS2_TOKEN_IS_MISSING_ACSURL,
            message: '3DS2Challenge_Error: Decoded token is missing a valid acsURL property'
        };
        expect(onSubmitAnalytics).toHaveBeenCalledWith(analyticsError);

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(1);
    });

    test('should call onError and onSubmitAnalytics when acsTransID is not valid', () => {
        const alteredToken = { ...challengeToken };
        alteredToken.acsTransID = '';

        prepareProps(alteredToken);

        const propsMock = { ...propsMaster };

        renderPrepareChallenge(propsMock);

        expect(errorMessage).toBe(`${ErrorEventCode.THREEDS2_TOKEN_IS_MISSING_OTHER_PROPS}: Data parsing error`);

        const analyticsError = {
            ...baseAnalyticsError,
            code: ErrorEventCode.THREEDS2_TOKEN_IS_MISSING_OTHER_PROPS,
            message:
                '3DS2Challenge_Error: Decoded token is missing one or more of the following properties (acsTransID | messageVersion | threeDSServerTransID)'
        };
        expect(onSubmitAnalytics).toHaveBeenCalledWith(analyticsError);

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(1);
    });

    test('should call onError and onSubmitAnalytics when messageVersion is not valid', () => {
        const alteredToken = { ...challengeToken };
        delete alteredToken.messageVersion;

        prepareProps(alteredToken);

        const propsMock = { ...propsMaster };

        renderPrepareChallenge(propsMock);

        expect(errorMessage).toBe(`${ErrorEventCode.THREEDS2_TOKEN_IS_MISSING_OTHER_PROPS}: Data parsing error`);

        const analyticsError = {
            ...baseAnalyticsError,
            code: ErrorEventCode.THREEDS2_TOKEN_IS_MISSING_OTHER_PROPS,
            message:
                '3DS2Challenge_Error: Decoded token is missing one or more of the following properties (acsTransID | messageVersion | threeDSServerTransID)'
        };
        expect(onSubmitAnalytics).toHaveBeenCalledWith(analyticsError);

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(1);
    });

    test('should call onError and onSubmitAnalytics when threeDSServerTransID is not valid', () => {
        const alteredToken = { ...challengeToken };
        delete alteredToken.threeDSServerTransID;

        prepareProps(alteredToken);

        const propsMock = { ...propsMaster };

        renderPrepareChallenge(propsMock);

        expect(errorMessage).toBe(`${ErrorEventCode.THREEDS2_TOKEN_IS_MISSING_OTHER_PROPS}: Data parsing error`);

        const analyticsError = {
            ...baseAnalyticsError,
            code: ErrorEventCode.THREEDS2_TOKEN_IS_MISSING_OTHER_PROPS,
            message:
                '3DS2Challenge_Error: Decoded token is missing one or more of the following properties (acsTransID | messageVersion | threeDSServerTransID)'
        };
        expect(onSubmitAnalytics).toHaveBeenCalledWith(analyticsError);

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(1);
    });
});
