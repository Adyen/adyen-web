import AmazonPay from './AmazonPay';
import AmazonPayDefault from './index';
import defaultProps from './defaultProps';
import { httpPost } from '../../core/Services/http';
import { mock } from 'jest-mock-extended';
import { AmazonPayConfiguration } from './types';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

jest.mock('../../core/Services/http');

const declineFlowMock = {
    declineFlowUrl: 'https://example.com'
};

const spyFetch = (httpPost as jest.Mock).mockImplementation(jest.fn(() => Promise.resolve(declineFlowMock)));

describe('AmazonPay', () => {
    const core = setupCoreMock();

    const amazonProps = mock<AmazonPayConfiguration>();
    const getElement = (props = {}) =>
        new AmazonPay(core, {
            ...defaultProps,
            ...props,
            ...amazonProps
        });

    test('always returns isValid as true', () => {
        const amazonPay = getElement();
        expect(amazonPay.isValid).toBe(true);
    });

    test('returns a type', () => {
        const amazonPay = getElement();
        expect(amazonPay.data.paymentMethod.type).toBe('amazonpay');
    });

    test('is exported as default from index', () => {
        expect(AmazonPayDefault).toBe(AmazonPay);
    });

    describe('formatProps', () => {
        test('formats props correctly', () => {
            const props = {
                environment: 'test',
                locale: 'en-US',
                configuration: {
                    region: 'EU'
                }
            };
            const amazonPay = getElement(props);
            expect(amazonPay.props.environment).toBe('TEST');
            expect(amazonPay.props.locale).toBe('en_US');
            expect(amazonPay.props.configuration.region).toBe('EU');
        });

        test('sets checkoutMode to ProcessOrder when isDropin is true', () => {
            const amazonPay = getElement({ isDropin: true });
            // @ts-ignore checkoutMode is set dynamically by formatProps
            expect(amazonPay.props.checkoutMode).toBe('ProcessOrder');
        });

        test('preserves checkoutMode when isDropin is false', () => {
            // @ts-ignore checkoutMode is set dynamically by formatProps
            const amazonPay = getElement({ isDropin: false, checkoutMode: 'ReviewOrder' });
            // @ts-ignore checkoutMode is set dynamically by formatProps
            expect(amazonPay.props.checkoutMode).toBe('ReviewOrder');
        });

        test('sets productType to PayOnly when isDropin is true and no addressDetails', () => {
            const amazonPay = getElement({ isDropin: true });
            expect(amazonPay.props.productType).toBe('PayOnly');
        });

        test('preserves productType when isDropin is true but addressDetails is provided', () => {
            const amazonPay = getElement({
                isDropin: true,
                addressDetails: { name: 'Test' },
                productType: 'PayAndShip'
            });
            expect(amazonPay.props.productType).toBe('PayAndShip');
        });
    });

    describe('formatData', () => {
        test('includes checkoutSessionId when amazonCheckoutSessionId is provided', () => {
            const amazonPay = getElement({ amazonCheckoutSessionId: 'SESSION123' });
            expect(amazonPay.data.paymentMethod.checkoutSessionId).toBe('SESSION123');
        });

        test('does not include checkoutSessionId when not provided', () => {
            const amazonPay = getElement({ amazonCheckoutSessionId: undefined });
            expect(amazonPay.data.paymentMethod.checkoutSessionId).toBeUndefined();
        });

        test('includes browserInfo in data', () => {
            const amazonPay = getElement();
            expect(amazonPay.data.browserInfo).toBeDefined();
            expect(amazonPay.data.browserInfo).toHaveProperty('userAgent');
        });
    });

    describe('browserInfo', () => {
        test('returns browser info object', () => {
            const amazonPay = getElement();
            expect(amazonPay.browserInfo).toBeDefined();
            expect(amazonPay.browserInfo).toHaveProperty('userAgent');
        });
    });

    describe('submit', () => {
        test('calls makePaymentsCall when no componentRef submit function exists', () => {
            const amazonPay = getElement();
            // @ts-ignore accessing protected method for testing
            const makePaymentsCallSpy = jest.spyOn(amazonPay, 'makePaymentsCall').mockResolvedValue({ resultCode: 'Authorised' });
            amazonPay.submit();
            expect(makePaymentsCallSpy).toHaveBeenCalled();
        });

        test('calls componentRef getSubmitFunction when available', () => {
            const amazonPay = getElement();
            const mockSubmitFn = jest.fn();
            // @ts-ignore setting componentRef for testing
            amazonPay.componentRef = {
                getSubmitFunction: () => mockSubmitFn
            };
            amazonPay.submit();
            expect(mockSubmitFn).toHaveBeenCalled();
        });

        test('falls back to makePaymentsCall when getSubmitFunction returns null', () => {
            const amazonPay = getElement();
            // @ts-ignore setting componentRef for testing
            amazonPay.componentRef = {
                getSubmitFunction: () => null
            };
            // @ts-ignore accessing protected method for testing
            const makePaymentsCallSpy = jest.spyOn(amazonPay, 'makePaymentsCall').mockResolvedValue({ resultCode: 'Authorised' });
            amazonPay.submit();
            expect(makePaymentsCallSpy).toHaveBeenCalled();
        });
    });

    describe('getShopperDetails', () => {
        test('calls console.error if no checkoutSessionId is passed', () => {
            console.error = jest.fn();
            const amazonPay = getElement();
            void amazonPay.getShopperDetails();
            expect(console.error).toHaveBeenCalledTimes(1);
        });

        test('should call getShopperDetails', async () => {
            const amazonPay = getElement({ amazonCheckoutSessionId: 'ABC123' });
            const shopperDetails = { billingAddress: {} };
            spyFetch.mockResolvedValueOnce(shopperDetails);
            expect(await amazonPay.getShopperDetails()).toBe(shopperDetails);
        });
    });

    describe('handleDeclineFlow', () => {
        test('calls console.error if no amazonCheckoutSessionId is passed', () => {
            console.error = jest.fn();
            const amazonPay = getElement();
            amazonPay.handleDeclineFlow();
            expect(console.error).toHaveBeenCalledTimes(1);
        });

        test('redirects the shopper if a declineFlowUrl is received', async () => {
            Object.defineProperty(window, 'location', {
                writable: true,
                value: { assign: jest.fn() }
            });
            const amazonPay = getElement({ amazonCheckoutSessionId: 'ABC123' });
            /* eslint-disable @typescript-eslint/await-thenable */
            void (await amazonPay.handleDeclineFlow());
            expect(window.location.assign).toHaveBeenCalledTimes(1);
        });

        test('calls onError if declineFlowUrl is missing from response', async () => {
            const onError = jest.fn();
            spyFetch.mockResolvedValueOnce({});
            const amazonPay = getElement({
                amazonCheckoutSessionId: 'ABC123',
                onError
            });
            amazonPay.handleDeclineFlow();
            await new Promise(resolve => setTimeout(resolve, 50));
            expect(onError).toHaveBeenCalled();
        });

        test('calls onError if the request fails', async () => {
            const onError = jest.fn();
            spyFetch.mockRejectedValueOnce(new Error('Network error'));
            const amazonPay = getElement({
                amazonCheckoutSessionId: 'ABC123',
                onError
            });
            amazonPay.handleDeclineFlow();
            await new Promise(resolve => setTimeout(resolve, 50));
            expect(onError).toHaveBeenCalled();
        });
    });
});
