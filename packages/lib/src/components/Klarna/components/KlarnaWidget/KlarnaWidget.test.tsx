import { h } from 'preact';
import { fireEvent, render, screen } from '@testing-library/preact';
import { KlarnaWidget } from './KlarnaWidget';
import Script from '../../../../utils/Script';
import { KLARNA_WIDGET_URL } from '../../constants';
import { KlarnaWidgetAuthorizeResponse, type KlarnaWidgetProps } from '../../types';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { mock } from 'jest-mock-extended';
import { AnalyticsModule } from '../../../../types/global-types';

jest.mock('../../../../utils/Script', () => {
    return jest.fn().mockImplementation(() => {
        return { load: mockScriptLoaded, remove: jest.fn() };
    });
});
const mockScriptLoaded = jest.fn().mockImplementation(() => {
    window.klarnaAsyncCallback();
});

const mockAnalytics = mock<AnalyticsModule>();

const customRender = (props: KlarnaWidgetProps) => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources} analytics={mockAnalytics}>
            <KlarnaWidget {...props} />
        </CoreProvider>
    );
};

let klarnaObj;
const originalLocation = window;
const klarnaInit = jest.fn();
const getKlarnaActionImp = (res: Partial<KlarnaWidgetAuthorizeResponse> = {}) =>
    jest.fn().mockImplementation((_, onAction) => {
        onAction(res);
    });

describe('KlarnaWidget', () => {
    const onLoaded = jest.fn();
    const onComplete = jest.fn();
    const onError = jest.fn();
    const paymentData = 'test';
    const paymentMethodType = 'klarna';
    const sdkData = { client_token: '123', payment_method_category: 'paynow' };
    const payButton = props => (
        <button data-testid="pay-with-klarna" {...props}>
            Pay with Klarna
        </button>
    );
    const props = {
        onLoaded,
        onComplete,
        onError,
        paymentData,
        paymentMethodType,
        sdkData,
        payButton,
        widgetInitializationTime: new Date().getTime()
    };

    beforeAll(() => {
        klarnaObj = {
            Payments: {
                init: klarnaInit,
                load: jest.fn(),
                authorize: jest.fn()
            }
        };
        Object.defineProperty(window, 'Klarna', {
            value: klarnaObj
        });
    });

    afterAll(() => {
        jest.restoreAllMocks();
        Object.defineProperty(globalThis, 'window', {
            value: originalLocation
        });
    });

    describe('Klarna widget initialization', () => {
        test('should download Klarna widget script on init', () => {
            customRender(props);
            expect(Script).toHaveBeenCalledWith({ src: KLARNA_WIDGET_URL, component: 'klarna', analytics: mockAnalytics });
            expect(mockScriptLoaded).toHaveBeenCalledTimes(1);
        });

        test('should show pay button on init', async () => {
            customRender(props);
            expect(await screen.findByTestId('pay-with-klarna')).toBeTruthy();
        });

        test('should call Klarna init with client_token', () => {
            customRender(props);
            expect(klarnaInit).toHaveBeenCalledWith({ client_token: sdkData.client_token });
        });

        test('should call props onLoaded if Klarna pre-authorization passed', () => {
            klarnaObj.Payments.load = getKlarnaActionImp({ show_form: true });
            customRender(props);
            expect(onLoaded).toHaveBeenCalled();
        });

        test('should call props onComplete if Klarna pre-authorization failed', () => {
            klarnaObj.Payments.load = getKlarnaActionImp({ show_form: false });
            customRender(props);
            expect(onComplete).toHaveBeenCalledWith({
                data: {
                    paymentData,
                    details: {}
                }
            });
        });
    });

    describe('Pay with Klarna widget', () => {
        test('should call the onComplete if the payment is authorized', async () => {
            const authRes = { approved: true, show_form: true, authorization_token: 'abc' };
            klarnaObj.Payments.load = getKlarnaActionImp({ show_form: true });
            klarnaObj.Payments.authorize = getKlarnaActionImp(authRes);
            customRender(props);
            fireEvent.click(await screen.findByTestId(/pay-with-klarna/i));
            expect(onComplete).toHaveBeenCalledWith({
                data: {
                    paymentData,
                    details: {
                        authorization_token: authRes.authorization_token
                    }
                }
            });
        });
        test('should call the onError if the payment is not authorized temporarily', async () => {
            klarnaObj.Payments.load = getKlarnaActionImp({ show_form: true });
            const authRes = { approved: false, show_form: true };
            klarnaObj.Payments.authorize = getKlarnaActionImp(authRes);
            customRender(props);
            fireEvent.click(await screen.findByTestId(/pay-with-klarna/i));
            expect(onError).toHaveBeenCalledWith(authRes);
        });

        test('should call the onComplete if the payment is not authorized permanently', async () => {
            klarnaObj.Payments.load = getKlarnaActionImp({ show_form: true });
            klarnaObj.Payments.authorize = getKlarnaActionImp({ show_form: false });
            customRender(props);
            fireEvent.click(await screen.findByTestId(/pay-with-klarna/i));
            expect(onComplete).toHaveBeenCalledWith({
                data: {
                    paymentData,
                    details: {}
                }
            });
        });
    });
});
