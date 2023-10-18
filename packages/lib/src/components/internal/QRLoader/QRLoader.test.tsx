import { mount } from 'enzyme';
import { h } from 'preact';
import QRLoader from './QRLoader';
import checkPaymentStatus from '../../../core/Services/payment-status';
import CoreProvider from '../../../core/Context/CoreProvider';
import { SRPanel } from '../../../core/Errors/SRPanel';
import SRPanelProvider from '../../../core/Errors/SRPanelProvider';

jest.mock('../../../core/Services/payment-status');

const getWrapper = ui => {
    const srPanel = new SRPanel({ core: global.core });
    return mount(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <SRPanelProvider srPanel={srPanel}> {ui}</SRPanelProvider>
        </CoreProvider>
    );
};

describe('QRLoader', () => {
    beforeAll(() => {
        Object.defineProperty(window, 'matchMedia', {
            value: jest.fn(() => ({ matches: true }))
        });
    });

    describe('checkStatus', () => {
        // Pending status
        test('checkStatus processes a pending response', () => {
            // Mock the checkPaymentStatusValue with a pending response
            const checkPaymentStatusValue = { payload: 'Ab02b4c0!', resultCode: 'pending', type: 'complete' };
            (checkPaymentStatus as jest.Mock).mockReturnValueOnce(Promise.resolve(checkPaymentStatusValue));

            const qrloader = getWrapper(<QRLoader />);

            qrloader
                .find('QRLoader')
                .instance()
                .checkStatus()
                .then(status => {
                    expect(status.props).toEqual(checkPaymentStatusValue);
                    expect(status.type).toBe('pending');
                });
        });

        // Authorised status
        test('checkStatus processes a authorised response', () => {
            // Mock the checkPaymentStatusValue with an authorised response
            const checkPaymentStatusValue = { payload: 'Ab02b4c0!', resultCode: 'authorised', type: 'complete' };
            (checkPaymentStatus as jest.Mock).mockReturnValueOnce(Promise.resolve(checkPaymentStatusValue));

            const onCompleteMock = jest.fn();
            const onErrorMock = jest.fn();
            const expectedResult = {
                data: {
                    details: {
                        payload: 'Ab02b4c0!' // this should come from the status endpoint
                    },
                    paymentData: 'Ab02b4c0!2' // this should come from the initial props (from the initial /payments call)
                }
            };

            const qrloader = getWrapper(<QRLoader paymentData={'Ab02b4c0!2'} onComplete={onCompleteMock} onError={onErrorMock} />);
            qrloader
                .find('QRLoader')
                .instance()
                .checkStatus()
                .then(status => {
                    expect(status.props).toEqual(checkPaymentStatusValue);
                    expect(status.type).toBe('success');
                    expect(onCompleteMock.mock.calls.length).toBe(1);
                    expect(onCompleteMock).toBeCalledWith(expectedResult, expect.any(Object));
                    expect(onErrorMock.mock.calls.length).toBe(0);
                    expect(qrloader.find('QRLoader').state('completed')).toBe(true);
                });
        });

        // Error status
        test('checkStatus processes an error response', () => {
            // Mock the checkPaymentStatusValue with an error
            const checkPaymentStatusValue = { error: 'Unkown error' };
            (checkPaymentStatus as jest.Mock).mockReturnValueOnce(Promise.resolve(checkPaymentStatusValue));

            const onCompleteMock = jest.fn();
            const onErrorMock = jest.fn();

            const qrloader = getWrapper(<QRLoader onComplete={onCompleteMock} onError={onErrorMock} />);

            qrloader
                .find('QRLoader')
                .instance()
                .checkStatus()
                .then(status => {
                    expect(status.props).toEqual(checkPaymentStatusValue);
                    expect(status.type).toBe('error');
                    expect(onCompleteMock.mock.calls.length).toBe(0);
                    expect(onErrorMock.mock.calls.length).toBe(1);
                });
        });
    });
});
