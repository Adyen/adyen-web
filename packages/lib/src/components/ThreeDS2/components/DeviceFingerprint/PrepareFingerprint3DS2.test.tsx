import { mount } from 'enzyme';
import { h } from 'preact';
import PrepareFingerprint3DS2 from './PrepareFingerprint3DS2';
import { THREEDS2_ERROR, THREEDS2_FINGERPRINT_ERROR, THREEDS2_FULL, TIMEOUT } from '../../constants';
import { Analytics3DS2Errors, Analytics3DS2Events, ANALYTICS_ERROR_TYPE } from '../../../../core/Analytics/constants';

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
        // notificationURL: '',
        paymentData: 'Ab02b4c0!BQABAg',
        type: 'threeDS2Fingerprint',
        token: btoa(threeDS2FingerPrintToken)
    };
};

let onSubmitAnalytics: any;
let wrapper: any;

const onError: any = () => {};

const baseAnalyticsError = {
    type: THREEDS2_ERROR,
    errorType: ANALYTICS_ERROR_TYPE.apiError
};

let completeFunction: any;

const completedAnalyticsObj = {
    message: '3DS2 fingerprinting has completed',
    type: THREEDS2_FULL,
    subtype: Analytics3DS2Events.FINGERPRINT_COMPLETED
};

const formResult = `
            <html>
                <body>
                    <script>
                    var data = {};
                    data.result = {};
                    data.result.threeDSCompInd = 'Y';
                    data.type = 'fingerPrintResult';

                    var result = JSON.stringify(data);
                    window.parent.postMessage(result, 'http://localhost:8011');
                    </script>
                </body>
            </html>
        `;

const mountPrepareFingerprint = props => {
    wrapper = mount(
        <PrepareFingerprint3DS2 {...props} isMDFlow={false} onError={onError} onComplete={completeFunction} onSubmitAnalytics={onSubmitAnalytics} />
    );
};

describe('ThreeDS2DeviceFingerprint - Happy flow', () => {
    beforeEach(() => {
        completeFunction = jest.fn();

        onSubmitAnalytics = jest.fn();
    });

    test("Doesn't throw an error when passing correct properties", () => {
        HTMLFormElement.prototype.submit = jest.fn().mockImplementation(() => formResult);

        prepareProps();

        mountPrepareFingerprint(propsMaster);

        expect(onSubmitAnalytics).toHaveBeenCalledWith({
            type: THREEDS2_FULL,
            message: 'threeDSMethodData sent',
            subtype: Analytics3DS2Events.FINGERPRINT_DATA_SENT
        });

        const prepFingComp = wrapper.find('PrepareFingerprint3DS2');
        expect(prepFingComp.props()).toHaveProperty('dataKey', 'fingerprintResult');
        expect(prepFingComp.props()).toHaveProperty('paymentData', 'Ab02b4c0!BQABAg');
    });

    test("Testing calls to component's setStatusComplete method - with completed result", done => {
        HTMLFormElement.prototype.submit = jest.fn().mockImplementation(() => formResult);

        prepareProps();

        mountPrepareFingerprint(propsMaster);

        const prepFingComp = wrapper.find('PrepareFingerprint3DS2');

        // mock successful scenario
        prepFingComp.instance().setStatusComplete({ threeDSCompInd: 'Y' });

        // Wait for the component to make a call to setState
        setTimeout(() => {
            // analytics to say process is complete
            expect(onSubmitAnalytics).toHaveBeenCalledWith({ ...completedAnalyticsObj, result: 'success' });

            expect(onSubmitAnalytics).toHaveBeenCalledTimes(2);

            expect(completeFunction).toHaveBeenCalledTimes(1);
            done();
        }, 0);
    });
});

describe('ThreeDS2DeviceFingerprint - flow completes with errors that are considered valid scenarios', () => {
    beforeEach(() => {
        completeFunction = jest.fn();

        onSubmitAnalytics = jest.fn();
    });

    test("Testing calls to component's setStatusComplete method - when fingerprint times-out", done => {
        HTMLFormElement.prototype.submit = jest.fn().mockImplementation(() => formResult);

        prepareProps();

        mountPrepareFingerprint(propsMaster);

        const prepFingComp = wrapper.find('PrepareFingerprint3DS2');

        // mock timed-out scenario
        prepFingComp.instance().setStatusComplete(
            { threeDSCompInd: 'N' },
            {
                errorCode: 'timeout',
                message: 'threeDS2Fingerprint: timeout'
            }
        );

        // Wait for the component to make a call to setState
        setTimeout(() => {
            // analytics for error
            expect(onSubmitAnalytics).toHaveBeenCalledWith({
                type: THREEDS2_ERROR,
                message: 'threeDS2Fingerprint: timeout',
                code: Analytics3DS2Errors.THREEDS2_TIMEOUT,
                errorType: ANALYTICS_ERROR_TYPE.network
            });

            // analytics to say process is complete
            expect(onSubmitAnalytics).toHaveBeenCalledWith({ ...completedAnalyticsObj, result: TIMEOUT });

            expect(onSubmitAnalytics).toHaveBeenCalledTimes(3);

            expect(completeFunction).toHaveBeenCalledTimes(1);
            done();
        }, 0);
    });
});

describe('ThreeDS2DeviceFingerprint - unhappy flows', () => {
    beforeEach(() => {
        completeFunction = jest.fn();

        onSubmitAnalytics = jest.fn(() => {});
    });

    test('Calls onComplete & onSubmitAnalytics callbacks when token is missing from props', () => {
        // prep
        prepareProps();

        const propsMock = { ...propsMaster };
        delete propsMock.token;

        // mount
        mountPrepareFingerprint(propsMock);

        // assert
        const analyticsError = {
            ...baseAnalyticsError,
            code: Analytics3DS2Errors.ACTION_IS_MISSING_TOKEN,
            message: '3DS2Fingerprint_Error: Missing "token" property from threeDS2 action'
        };
        expect(onSubmitAnalytics).toHaveBeenCalledWith(analyticsError);

        // fingerprinting always completes
        expect(completeFunction).toHaveBeenCalledTimes(1);

        expect(onSubmitAnalytics).toHaveBeenCalledWith({ ...completedAnalyticsObj, result: 'failedInternal' });
        expect(onSubmitAnalytics).toHaveBeenCalledTimes(2);
    });

    test('Calls onComplete & onSubmitAnalytics callbacks when token is not base64', () => {
        // prep
        prepareProps();

        const propsMock = { ...propsMaster };
        propsMock.token = 'some string';

        // mount
        mountPrepareFingerprint(propsMock);

        // assert
        const analyticsError = {
            ...baseAnalyticsError,
            code: Analytics3DS2Errors.TOKEN_DECODE_OR_PARSING_FAILED,
            message: `${THREEDS2_FINGERPRINT_ERROR}: not base64`
        };
        expect(onSubmitAnalytics).toHaveBeenCalledWith(analyticsError);

        // fingerprinting always completes
        expect(completeFunction).toHaveBeenCalledTimes(1);

        expect(onSubmitAnalytics).toHaveBeenCalledWith({ ...completedAnalyticsObj, result: 'failedInternal' });
        expect(onSubmitAnalytics).toHaveBeenCalledTimes(2);
    });

    test('Calls onComplete & onSubmitAnalytics callbacks when threeDSMethodUrl in not valid', () => {
        // prep
        const alteredToken = { ...fingerPrintToken };
        alteredToken.threeDSMethodUrl = '';

        prepareProps(alteredToken);

        const propsMock = { ...propsMaster };

        // mount
        mountPrepareFingerprint(propsMock);

        // assert
        const analyticsError = {
            ...baseAnalyticsError,
            code: Analytics3DS2Errors.TOKEN_IS_MISSING_THREEDSMETHODURL,
            message: `${THREEDS2_FINGERPRINT_ERROR}: Decoded token is missing a valid threeDSMethodURL property`
        };

        // fingerprinting always completes
        expect(completeFunction).toHaveBeenCalledTimes(1);

        expect(onSubmitAnalytics).toHaveBeenCalledWith(analyticsError);

        expect(onSubmitAnalytics).toHaveBeenCalledWith({ ...completedAnalyticsObj, result: 'noThreeDSMethodURL' });

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(2);
    });

    test('Calls onComplete & onSubmitAnalytics callbacks when threeDSMethodNotificationURL in not valid', () => {
        // prep
        const alteredToken = { ...fingerPrintToken };
        alteredToken.threeDSMethodNotificationURL = '';

        prepareProps(alteredToken);

        const propsMock = { ...propsMaster };

        // mount
        mountPrepareFingerprint(propsMock);

        // assert
        const analyticsError = {
            ...baseAnalyticsError,
            code: Analytics3DS2Errors.TOKEN_IS_MISSING_OTHER_PROPS,
            message: `${THREEDS2_FINGERPRINT_ERROR}: Decoded token is missing one or more of the following properties (threeDSMethodNotificationURL | postMessageDomain | threeDSServerTransID)`
        };

        // fingerprinting always completes
        expect(completeFunction).toHaveBeenCalledTimes(1);

        expect(onSubmitAnalytics).toHaveBeenCalledWith(analyticsError);

        expect(onSubmitAnalytics).toHaveBeenCalledWith({ ...completedAnalyticsObj, result: 'failedInternal' });

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(2);
    });

    test('Calls onComplete & onSubmitAnalytics callbacks when threeDSServerTransID in not valid', () => {
        // prep
        const alteredToken = { ...fingerPrintToken };
        alteredToken.threeDSServerTransID = '';

        prepareProps(alteredToken);

        const propsMock = { ...propsMaster };

        // mount
        mountPrepareFingerprint(propsMock);

        // assert
        const analyticsError = {
            ...baseAnalyticsError,
            code: Analytics3DS2Errors.TOKEN_IS_MISSING_OTHER_PROPS,
            message: `${THREEDS2_FINGERPRINT_ERROR}: Decoded token is missing one or more of the following properties (threeDSMethodNotificationURL | postMessageDomain | threeDSServerTransID)`
        };

        // fingerprinting always completes
        expect(completeFunction).toHaveBeenCalledTimes(1);

        expect(onSubmitAnalytics).toHaveBeenCalledWith(analyticsError);

        expect(onSubmitAnalytics).toHaveBeenCalledWith({ ...completedAnalyticsObj, result: 'failedInternal' });

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(2);
    });
});
