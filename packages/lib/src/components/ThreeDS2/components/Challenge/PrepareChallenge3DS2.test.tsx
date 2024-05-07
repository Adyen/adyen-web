import { mount } from 'enzyme';
import { h } from 'preact';
import PrepareChallenge3DS2 from './PrepareChallenge3DS2';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { THREEDS2_ERROR, THREEDS2_FULL } from '../../constants';
import { Analytics3DS2Errors, ANALYTICS_API_ERROR, ANALYTICS_NETWORK_ERROR } from '../../../../core/Analytics/constants';

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
    type: THREEDS2_ERROR,
    errorType: ANALYTICS_API_ERROR
};

let onSubmitAnalytics: any;

const completeFunction = jest.fn();

const formResult = `
            <html>
                <body>
                    <script>
                    var data = {};
                    data.result = {};
                    data.result.transStatus = 'Y';
                    data.type = 'challengeResult';

                    var result = JSON.stringify(data);
                    window.parent.postMessage(result, 'http://localhost:8011');
                    </script>
                </body>
            </html>
        `;

let wrapper: any;

const mountPrepareChallenge = props => {
    wrapper = mount(
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
    });

    test("Doesn't throw an error when passing correct properties", () => {
        HTMLFormElement.prototype.submit = jest.fn().mockImplementation(() => formResult);

        prepareProps();

        mountPrepareChallenge(propsMaster);

        expect(onError.mock.calls.length).toBe(0);

        expect(onSubmitAnalytics).toBeCalledWith({
            type: THREEDS2_FULL,
            message: 'creq sent'
        });

        const prepChallComp = wrapper.find('PrepareChallenge3DS2');
        expect(prepChallComp.props()).toHaveProperty('challengeWindowSize', '01');
        expect(prepChallComp.props()).toHaveProperty('paymentData', 'Ab02b4c0!BQABAg');
    });

    test("Testing calls to component's setStatusComplete method - with completed result", done => {
        HTMLFormElement.prototype.submit = jest.fn().mockImplementation(() => formResult);

        prepareProps();

        mountPrepareChallenge(propsMaster);

        const prepChallComp = wrapper.find('PrepareChallenge3DS2');

        // mock successful scenario
        prepChallComp.instance().setStatusComplete({ transStatus: 'Y' });

        // Wait for the component to make a call to setState
        setTimeout(() => {
            // analytics to say process is complete
            expect(onSubmitAnalytics).toHaveBeenCalledWith({ type: THREEDS2_FULL, message: '3DS2 challenge has completed' });

            expect(onSubmitAnalytics).toHaveBeenCalledTimes(2);
            // console.log('### PrepareChallenge3DS2.test::CALLS:: ', onSubmitAnalytics.mock.calls);
            done();
        }, 0);
    });
});

describe('PrepareChallenge3DS2 - flow completes with errors that are considered valid scenarios', () => {
    beforeEach(() => {
        onError = jest.fn();

        onSubmitAnalytics = jest.fn();
    });

    test("Testing calls to component's setStatusComplete method - when challenge times-out", done => {
        HTMLFormElement.prototype.submit = jest.fn().mockImplementation(() => formResult);

        prepareProps();

        mountPrepareChallenge(propsMaster);

        const prepChallComp = wrapper.find('PrepareChallenge3DS2');

        // mock timed-out scenario
        prepChallComp.instance().setStatusComplete(
            { transStatus: 'U' },
            {
                errorCode: 'timeout',
                message: 'threeDS2Challenge: timeout'
            }
        );

        // Wait for the component to make a call to setState
        setTimeout(() => {
            // analytics for error
            expect(onSubmitAnalytics).toHaveBeenCalledWith({
                type: THREEDS2_ERROR,
                message: 'threeDS2Challenge: timeout',
                code: Analytics3DS2Errors.THREEDS2_TIMEOUT,
                errorType: ANALYTICS_NETWORK_ERROR
            });

            // analytics to say process is complete
            expect(onSubmitAnalytics).toHaveBeenCalledWith({ type: THREEDS2_FULL, message: '3DS2 challenge has completed' });

            expect(onSubmitAnalytics).toHaveBeenCalledTimes(3);
            done();
        }, 0);
    });

    test("Testing calls to component's setStatusComplete method - when there is no transStatus", done => {
        HTMLFormElement.prototype.submit = jest.fn().mockImplementation(() => formResult);

        prepareProps();

        mountPrepareChallenge(propsMaster);

        const prepChallComp = wrapper.find('PrepareChallenge3DS2');

        // mock no transStatus scenario
        prepChallComp.instance().setStatusComplete(
            {},
            {
                errorCode: 'no trans status',
                message: 'threeDS2Challenge: no transStatus could be retrieved'
            }
        );

        // Wait for the component to make a call to setState
        setTimeout(() => {
            // analytics for error
            expect(onSubmitAnalytics).toHaveBeenCalledWith({
                type: THREEDS2_ERROR,
                message: 'threeDS2Challenge: no transStatus could be retrieved',
                code: Analytics3DS2Errors.NO_TRANSSTATUS,
                errorType: ANALYTICS_API_ERROR
            });

            // analytics to say process is complete
            expect(onSubmitAnalytics).toHaveBeenCalledWith({ type: THREEDS2_FULL, message: '3DS2 challenge has completed' });

            expect(onSubmitAnalytics).toHaveBeenCalledTimes(3);
            done();
        }, 0);
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

    test('Calls onError & onSubmitAnalytics callbacks when token is missing from props', () => {
        // prep
        prepareProps();

        const propsMock = { ...propsMaster };
        delete propsMock.token;

        // mount
        mountPrepareChallenge(propsMock);

        // assert
        expect(errorMessage).toBe(`${Analytics3DS2Errors.ACTION_IS_MISSING_TOKEN}: Data parsing error`);

        const analyticsError = {
            ...baseAnalyticsError,
            code: Analytics3DS2Errors.ACTION_IS_MISSING_TOKEN,
            message: '3DS2Challenge_Error: Missing "token" property from threeDS2 action'
        };
        expect(onSubmitAnalytics).toBeCalledWith(analyticsError);

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(1);
    });

    test('Calls onError & onSubmitAnalytics callbacks when token is not base64', () => {
        // prep
        prepareProps();

        const propsMock = { ...propsMaster };
        propsMock.token = 'some string';

        // mount
        mountPrepareChallenge(propsMock);

        // assert
        expect(errorMessage).toBe(`${Analytics3DS2Errors.TOKEN_DECODE_OR_PARSING_FAILED}: Data parsing error`);

        const analyticsError = {
            ...baseAnalyticsError,
            code: Analytics3DS2Errors.TOKEN_DECODE_OR_PARSING_FAILED,
            message: '3DS2Challenge_Error: not base64'
        };
        expect(onSubmitAnalytics).toBeCalledWith(analyticsError);

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(1);
    });

    test('Calls onError & onSubmitAnalytics callbacks when acsURL in not valid', () => {
        // prep
        const alteredToken = { ...challengeToken };
        alteredToken.acsURL = '';

        prepareProps(alteredToken);

        const propsMock = { ...propsMaster };

        // mount
        mountPrepareChallenge(propsMock);

        // assert
        expect(errorMessage).toBe(`${Analytics3DS2Errors.TOKEN_IS_MISSING_ACSURL}: Data parsing error`);

        const analyticsError = {
            ...baseAnalyticsError,
            code: Analytics3DS2Errors.TOKEN_IS_MISSING_ACSURL,
            message: '3DS2Challenge_Error: Decoded token is missing a valid acsURL property'
        };
        expect(onSubmitAnalytics).toBeCalledWith(analyticsError);

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(1);
    });

    test('Calls onError & onSubmitAnalytics callbacks when acsTransID in not valid', () => {
        // prep
        const alteredToken = { ...challengeToken };
        alteredToken.acsTransID = '';

        prepareProps(alteredToken);

        const propsMock = { ...propsMaster };

        // mount
        mountPrepareChallenge(propsMock);

        // assert
        expect(errorMessage).toBe(`${Analytics3DS2Errors.TOKEN_IS_MISSING_OTHER_PROPS}: Data parsing error`);

        const analyticsError = {
            ...baseAnalyticsError,
            code: Analytics3DS2Errors.TOKEN_IS_MISSING_OTHER_PROPS,
            message:
                '3DS2Challenge_Error: Decoded token is missing one or more of the following properties (acsTransID | messageVersion | threeDSServerTransID)'
        };
        expect(onSubmitAnalytics).toBeCalledWith(analyticsError);

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(1);
    });

    test('Calls onError & onSubmitAnalytics callbacks when messageVersion in not valid', () => {
        // prep
        const alteredToken = { ...challengeToken };
        delete alteredToken.messageVersion;

        prepareProps(alteredToken);

        const propsMock = { ...propsMaster };

        // mount
        mountPrepareChallenge(propsMock);

        // assert
        expect(errorMessage).toBe(`${Analytics3DS2Errors.TOKEN_IS_MISSING_OTHER_PROPS}: Data parsing error`);

        const analyticsError = {
            ...baseAnalyticsError,
            code: Analytics3DS2Errors.TOKEN_IS_MISSING_OTHER_PROPS,
            message:
                '3DS2Challenge_Error: Decoded token is missing one or more of the following properties (acsTransID | messageVersion | threeDSServerTransID)'
        };
        expect(onSubmitAnalytics).toBeCalledWith(analyticsError);

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(1);
    });

    test('Calls onError & onSubmitAnalytics callbacks when threeDSServerTransID in not valid', () => {
        // prep
        const alteredToken = { ...challengeToken };
        delete alteredToken.threeDSServerTransID;

        prepareProps(alteredToken);

        const propsMock = { ...propsMaster };

        // mount
        mountPrepareChallenge(propsMock);

        // assert
        expect(errorMessage).toBe(`${Analytics3DS2Errors.TOKEN_IS_MISSING_OTHER_PROPS}: Data parsing error`);

        const analyticsError = {
            ...baseAnalyticsError,
            code: Analytics3DS2Errors.TOKEN_IS_MISSING_OTHER_PROPS,
            message:
                '3DS2Challenge_Error: Decoded token is missing one or more of the following properties (acsTransID | messageVersion | threeDSServerTransID)'
        };
        expect(onSubmitAnalytics).toBeCalledWith(analyticsError);

        expect(onSubmitAnalytics).toHaveBeenCalledTimes(1);
    });
});
