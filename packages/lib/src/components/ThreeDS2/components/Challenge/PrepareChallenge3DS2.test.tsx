import { mount } from 'enzyme';
import { h } from 'preact';
import PrepareChallenge3DS2 from './PrepareChallenge3DS2';
import { CoreProvider } from '../../../../core/Context/CoreProvider';

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
    type: 'threeDS2Error',
    errorType: 'ApiError'
};

let onSubmitAnalytics: any;

const completeFunction = jest.fn();

const mountPrepareChallenge = props => {
    mount(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            {/*@ts-ignore Ignore typing on props*/}
            <PrepareChallenge3DS2 {...props} isMDFlow={false} onComplete={completeFunction} onSubmitAnalytics={onSubmitAnalytics} onError={onError} />
        </CoreProvider>
    );
};

describe('PrepareChallenge3DS2', () => {
    beforeEach(() => {
        onError = jest.fn();

        onSubmitAnalytics = jest.fn();
    });

    test("Doesn't throw an error when passing correct properties", () => {
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

        HTMLFormElement.prototype.submit = jest.fn().mockImplementation(() => formResult);

        prepareProps();

        mountPrepareChallenge(propsMaster);

        expect(onError.mock.calls.length).toBe(0);

        expect(onSubmitAnalytics).toBeCalledWith({
            type: 'threeDS2',
            message: 'creq sent'
        });
    });
});

describe('PrepareChallenge3DS2 - testing what happens when expected props are not present', () => {
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
        expect(errorMessage).toBe('701: Data parsing error');

        const analyticsError = { ...baseAnalyticsError, code: '701', message: '3DS2Challenge_Error: Missing "token" property from threeDS2 action' };
        expect(onSubmitAnalytics).toBeCalledWith(analyticsError);
    });

    test('Calls onError & onSubmitAnalytics callbacks when token is not base64', () => {
        // prep
        prepareProps();

        const propsMock = { ...propsMaster };
        propsMock.token = 'some string';

        // mount
        mountPrepareChallenge(propsMock);

        // assert
        expect(errorMessage).toBe('704: Data parsing error');

        const analyticsError = { ...baseAnalyticsError, code: '704', message: '3DS2Challenge_Error: not base64' };
        expect(onSubmitAnalytics).toBeCalledWith(analyticsError);
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
        expect(errorMessage).toBe('800: Data parsing error');

        const analyticsError = {
            ...baseAnalyticsError,
            code: '800',
            message: '3DS2Challenge_Error: Decoded token is missing a valid acsURL property'
        };
        expect(onSubmitAnalytics).toBeCalledWith(analyticsError);
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
        expect(errorMessage).toBe('703: Data parsing error');

        const analyticsError = {
            ...baseAnalyticsError,
            code: '703',
            message:
                '3DS2Challenge_Error: Decoded token is missing one or more of the following properties (acsTransID | messageVersion | threeDSServerTransID)'
        };
        expect(onSubmitAnalytics).toBeCalledWith(analyticsError);
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
        expect(errorMessage).toBe('703: Data parsing error');

        const analyticsError = {
            ...baseAnalyticsError,
            code: '703',
            message:
                '3DS2Challenge_Error: Decoded token is missing one or more of the following properties (acsTransID | messageVersion | threeDSServerTransID)'
        };
        expect(onSubmitAnalytics).toBeCalledWith(analyticsError);
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
        expect(errorMessage).toBe('703: Data parsing error');

        const analyticsError = {
            ...baseAnalyticsError,
            code: '703',
            message:
                '3DS2Challenge_Error: Decoded token is missing one or more of the following properties (acsTransID | messageVersion | threeDSServerTransID)'
        };
        expect(onSubmitAnalytics).toBeCalledWith(analyticsError);
    });
});
