import { h } from 'preact';
import { render, act } from '@testing-library/preact';
import PrepareFingerprint3DS2 from './PrepareFingerprint3DS2';
import { THREEDS2_FINGERPRINT_ERROR, THREEDS2_FULL, TIMEOUT } from '../../constants';
import { LogEventSubtype } from '../../../../core/Analytics/events/AnalyticsLogEvent';
import { ErrorEventCode, ErrorEventType } from '../../../../core/Analytics/events/AnalyticsErrorEvent';

const fingerPrintToken = {
    threeDSMessageVersion: '2.1.0',
    threeDSMethodNotificationURL: 'https://checkoutshopper-test.adyen.com/checkoutshopper/threeDSMethodNotification.shtml',
    threeDSMethodUrl: 'https://pal-test.adyen.com/threeds2simulator/acs/startMethod.shtml',
    threeDSServerTransID: 'dfa501d6'
};

let propsMaster: any;

const prepareProps = (token = fingerPrintToken) => {
    const threeDS2FingerPrintToken = JSON.stringify(token);

    propsMaster = {
        dataKey: 'fingerprintResult',
        paymentData: 'Ab02b4c0!BQABAg',
        type: 'threeDS2Fingerprint',
        token: btoa(threeDS2FingerPrintToken)
    };
};

let onSubmitAnalytics: any;

const onError: any = () => {};

const baseAnalyticsError = {
    errorType: ErrorEventType.threeDS2,
    timestamp: expect.any(String),
    id: expect.any(String)
};

let completeFunction: any;

const completedAnalyticsObj = {
    component: 'threeDS2Fingerprint',
    message: '3DS2 fingerprinting has completed',
    type: THREEDS2_FULL,
    subType: LogEventSubtype.fingerprintCompleted,
    timestamp: expect.any(String),
    id: expect.any(String)
};

let mockCallbacks: any = {};

jest.mock('./DoFingerprint3DS2', () => ({
    __esModule: true,
    default: function MockDoFingerprint(props) {
        mockCallbacks = {
            onCompleteFingerprint: props.onCompleteFingerprint,
            onErrorFingerprint: props.onErrorFingerprint
        };
        props.onFormSubmit?.('threeDSMethodData sent');
        return null;
    }
}));

const renderPrepareFingerprint = props => {
    return render(
        <PrepareFingerprint3DS2 {...props} isMDFlow={false} onError={onError} onComplete={completeFunction} onSubmitAnalytics={onSubmitAnalytics} />
    );
};

describe('ThreeDS2DeviceFingerprint - Happy flow', () => {
    beforeEach(() => {
        completeFunction = jest.fn();
        onSubmitAnalytics = jest.fn();
        mockCallbacks = {};
    });

    test('should not throw an error when passing correct properties', () => {
        prepareProps();

        renderPrepareFingerprint(propsMaster);

        expect(onSubmitAnalytics).toHaveBeenCalledWith({
            type: THREEDS2_FULL,
            component: 'threeDS2Fingerprint',
            message: 'threeDSMethodData sent',
            subType: LogEventSubtype.fingerprintDataSentWeb,
            timestamp: expect.any(String),
            id: expect.any(String)
        });
    });

    test('should fire completion analytics when fingerprint completes successfully', async () => {
        prepareProps();

        renderPrepareFingerprint(propsMaster);

        await act(() => {
            mockCallbacks.onCompleteFingerprint({ result: { threeDSCompInd: 'Y' } });
        });

        // analytics to say process is complete
        expect(onSubmitAnalytics).toHaveBeenCalledWith({ ...completedAnalyticsObj, result: 'success' });

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(2);

        expect(completeFunction).toHaveBeenCalledTimes(1);
    });
});

describe('ThreeDS2DeviceFingerprint - flow completes with errors that are considered valid scenarios', () => {
    beforeEach(() => {
        completeFunction = jest.fn();
        onSubmitAnalytics = jest.fn();
        mockCallbacks = {};
    });

    test('should fire timeout analytics when fingerprint times out', async () => {
        prepareProps();

        renderPrepareFingerprint(propsMaster);

        await act(() => {
            mockCallbacks.onErrorFingerprint({
                errorCode: 'timeout',
                result: { threeDSCompInd: 'N' }
            });
        });

        // analytics for error
        expect(onSubmitAnalytics).toHaveBeenCalledWith({
            component: 'threeDS2Fingerprint',
            message: 'threeDS2Fingerprint: timeout',
            code: ErrorEventCode.THREEDS2_TIMEOUT,
            errorType: ErrorEventType.threeDS2,
            timestamp: expect.any(String),
            id: expect.any(String)
        });

        // analytics to say process is complete
        expect(onSubmitAnalytics).toHaveBeenCalledWith({ ...completedAnalyticsObj, result: TIMEOUT });

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(3);

        expect(completeFunction).toHaveBeenCalledTimes(1);
    });
});

describe('ThreeDS2DeviceFingerprint - unhappy flows', () => {
    beforeEach(() => {
        completeFunction = jest.fn();
        onSubmitAnalytics = jest.fn(() => {});
    });

    test('should call onComplete and onSubmitAnalytics when token is missing from props', () => {
        prepareProps();

        const propsMock = { ...propsMaster };
        delete propsMock.token;

        renderPrepareFingerprint(propsMock);

        const analyticsError = {
            ...baseAnalyticsError,
            component: 'threeDS2Fingerprint',
            code: ErrorEventCode.THREEDS2_ACTION_IS_MISSING_TOKEN,
            message: '3DS2Fingerprint_Error: Missing "token" property from threeDS2 action'
        };
        expect(onSubmitAnalytics).toHaveBeenCalledWith(analyticsError);

        // fingerprinting always completes
        expect(completeFunction).toHaveBeenCalledTimes(1);

        expect(onSubmitAnalytics).toHaveBeenCalledWith({ ...completedAnalyticsObj, result: 'failedInternal' });
        expect(onSubmitAnalytics).toHaveBeenCalledTimes(2);
    });

    test('should call onComplete and onSubmitAnalytics when token is not base64', () => {
        prepareProps();

        const propsMock = { ...propsMaster };
        propsMock.token = 'some string';

        renderPrepareFingerprint(propsMock);

        const analyticsError = {
            ...baseAnalyticsError,
            component: 'threeDS2Fingerprint',
            code: ErrorEventCode.THREEDS2_TOKEN_DECODE_OR_PARSING_FAILED,
            message: `${THREEDS2_FINGERPRINT_ERROR}: not base64`
        };
        expect(onSubmitAnalytics).toHaveBeenCalledWith(analyticsError);

        // fingerprinting always completes
        expect(completeFunction).toHaveBeenCalledTimes(1);

        expect(onSubmitAnalytics).toHaveBeenCalledWith({ ...completedAnalyticsObj, result: 'failedInternal' });
        expect(onSubmitAnalytics).toHaveBeenCalledTimes(2);
    });

    test('should call onComplete and onSubmitAnalytics when threeDSMethodUrl is not valid', () => {
        const alteredToken = { ...fingerPrintToken };
        alteredToken.threeDSMethodUrl = '';

        prepareProps(alteredToken);

        const propsMock = { ...propsMaster };

        renderPrepareFingerprint(propsMock);

        const analyticsError = {
            ...baseAnalyticsError,
            component: 'threeDS2Fingerprint',
            code: ErrorEventCode.THREEDS2_TOKEN_IS_MISSING_THREEDSMETHODURL,
            message: `${THREEDS2_FINGERPRINT_ERROR}: Decoded token is missing a valid threeDSMethodURL property`
        };

        // fingerprinting always completes
        expect(completeFunction).toHaveBeenCalledTimes(1);

        expect(onSubmitAnalytics).toHaveBeenCalledWith(analyticsError);

        expect(onSubmitAnalytics).toHaveBeenCalledWith({ ...completedAnalyticsObj, result: 'noThreeDSMethodURL' });

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(2);
    });

    test('should call onComplete and onSubmitAnalytics when threeDSMethodNotificationURL is not valid', () => {
        const alteredToken = { ...fingerPrintToken };
        alteredToken.threeDSMethodNotificationURL = '';

        prepareProps(alteredToken);

        const propsMock = { ...propsMaster };

        renderPrepareFingerprint(propsMock);

        const analyticsError = {
            ...baseAnalyticsError,
            component: 'threeDS2Fingerprint',
            code: ErrorEventCode.THREEDS2_TOKEN_IS_MISSING_OTHER_PROPS,
            message: `${THREEDS2_FINGERPRINT_ERROR}: Decoded token is missing one or more of the following properties (threeDSMethodNotificationURL | postMessageDomain | threeDSServerTransID)`
        };

        // fingerprinting always completes
        expect(completeFunction).toHaveBeenCalledTimes(1);

        expect(onSubmitAnalytics).toHaveBeenCalledWith(analyticsError);

        expect(onSubmitAnalytics).toHaveBeenCalledWith({ ...completedAnalyticsObj, result: 'failedInternal' });

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(2);
    });

    test('should call onComplete and onSubmitAnalytics when threeDSServerTransID is not valid', () => {
        const alteredToken = { ...fingerPrintToken };
        alteredToken.threeDSServerTransID = '';

        prepareProps(alteredToken);

        const propsMock = { ...propsMaster };

        renderPrepareFingerprint(propsMock);

        const analyticsError = {
            ...baseAnalyticsError,
            component: 'threeDS2Fingerprint',
            code: ErrorEventCode.THREEDS2_TOKEN_IS_MISSING_OTHER_PROPS,
            message: `${THREEDS2_FINGERPRINT_ERROR}: Decoded token is missing one or more of the following properties (threeDSMethodNotificationURL | postMessageDomain | threeDSServerTransID)`
        };

        // fingerprinting always completes
        expect(completeFunction).toHaveBeenCalledTimes(1);

        expect(onSubmitAnalytics).toHaveBeenCalledWith(analyticsError);

        expect(onSubmitAnalytics).toHaveBeenCalledWith({ ...completedAnalyticsObj, result: 'failedInternal' });

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(2);
    });
});
