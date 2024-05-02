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

const threeDS2ChallengeToken = JSON.stringify(challengeToken);

const propsMaster = {
    challengeWindowSize: '01',
    dataKey: 'threeDSResult',
    i18n: global.i18n,
    paymentData: 'Ab02b4c0!BQABAg',
    token: btoa(threeDS2ChallengeToken)
};

let onError: any;
let errorMessage: string;

let onSubmitAnalytics: any;

const completeFunction = jest.fn();

describe('PrepareChallenge3DS2', () => {
    beforeEach(() => {
        errorMessage = null;

        onError = jest.fn(errObj => {
            errorMessage = errObj.message;
            console.log('### PrepareChallenge3DS2.test:::: err.msg', errObj.message);
            console.log('### PrepareChallenge3DS2.test:::: err.cause', errObj.cause);
        });

        onSubmitAnalytics = jest.fn(obj => {
            console.log('### PrepareChallenge3DS2.test::onSubmitAnalytics:: obj', obj);
        });
    });

    test('Calls onError & onSubmitAnalytics callbacks when token is missing from props', () => {
        const propsMock = { ...propsMaster };
        delete propsMock.token;

        mount(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                {/*@ts-ignore Ignore typing on props*/}
                <PrepareChallenge3DS2
                    {...propsMock}
                    isMDFlow={false}
                    onComplete={completeFunction}
                    onSubmitAnalytics={onSubmitAnalytics}
                    onError={onError}
                />
            </CoreProvider>
        );

        expect(errorMessage).toBe('701: Data parsing error');

        expect(onSubmitAnalytics).toBeCalled();
    });

    test('Calls onError & onSubmitAnalytics callbacks when token is not base64', () => {
        const propsMock = { ...propsMaster };
        propsMock.token = 'some string';

        mount(
            <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
                {/*@ts-ignore Ignore typing on props*/}
                <PrepareChallenge3DS2
                    {...propsMock}
                    isMDFlow={false}
                    onComplete={completeFunction}
                    onSubmitAnalytics={onSubmitAnalytics}
                    onError={onError}
                />
            </CoreProvider>
        );

        expect(errorMessage).toBe('704: Data parsing error');

        expect(onSubmitAnalytics).toBeCalled();
    });

    // test('Calls onError & onSubmitAnalytics callbacks when acsURL in not valid', () => {
    //     const propsMock = { ...propsMaster };
    //     propsMock.acsURL = 'some string';
    //
    //     mount(
    //         <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
    //             {/*@ts-ignore Ignore typing on props*/}
    //             <PrepareChallenge3DS2
    //                 {...propsMock}
    //                 isMDFlow={false}
    //                 onComplete={completeFunction}
    //                 onSubmitAnalytics={onSubmitAnalytics}
    //                 onError={onError}
    //             />
    //         </CoreProvider>
    //     );
    //
    //     expect(errorMessage).toBe('704: Data parsing error');
    //
    //     expect(onSubmitAnalytics).toBeCalled();
    // });
});
