import { mount } from 'enzyme';
import { h } from 'preact';
import PrepareFingerprint3DS2 from './PrepareFingerprint3DS2';
import { THREEDS2_ERROR, THREEDS2_FULL } from '../../constants';
import { Analytics3DS2Errors, ANALYTICS_API_ERROR } from '../../../../core/Analytics/constants';

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
    errorType: ANALYTICS_API_ERROR
};

let completeFunction: any;

const completedAnalyticsObj = { message: '3DS2 fingerprinting has completed', type: THREEDS2_FULL };

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

        expect(onSubmitAnalytics).toBeCalledWith({
            type: THREEDS2_FULL,
            message: 'threeDSMethodData sent'
        });

        const prepFingComp = wrapper.find('PrepareFingerprint3DS2');
        expect(prepFingComp.props()).toHaveProperty('dataKey', 'fingerprintResult');
        expect(prepFingComp.props()).toHaveProperty('paymentData', 'Ab02b4c0!BQABAg');
    });
});

describe('ThreeDS2DeviceFingerprint - unhappy flows', () => {
    beforeEach(() => {
        completeFunction = jest.fn();

        onSubmitAnalytics = jest.fn(() => {});
    });

    test('Calls onError & onSubmitAnalytics callbacks when token is missing from props', () => {
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
        expect(onSubmitAnalytics).toBeCalledWith(analyticsError);

        // fingerprinting always completes
        expect(onSubmitAnalytics).toBeCalledWith(completedAnalyticsObj);
        expect(completeFunction).toHaveBeenCalledTimes(1);

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(2);
    });

    test('Calls onError & onSubmitAnalytics callbacks when token is not base64', () => {
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
            message: '3DS2Fingerprint_Error: not base64'
        };
        expect(onSubmitAnalytics).toBeCalledWith(analyticsError);

        // fingerprinting always completes
        expect(onSubmitAnalytics).toBeCalledWith(completedAnalyticsObj);
        expect(completeFunction).toHaveBeenCalledTimes(1);

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(2);
    });
});
