import AmazonPay from './AmazonPay';
import defaultProps from './defaultProps';
import { httpPost } from '../../core/Services/http';
import { mock } from 'jest-mock-extended';
import { AmazonPayElementProps } from './types';

jest.mock('../../core/Services/http');

const declineFlowMock = {
    declineFlowUrl: 'https://example.com'
};

const spyFetch = (httpPost as jest.Mock).mockImplementation(jest.fn(() => Promise.resolve(declineFlowMock)));

describe('AmazonPay', () => {
    const amazonProps = mock<AmazonPayElementProps>();
    const getElement = (props = {}) =>
        new AmazonPay({
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

    test('format props correctly', () => {
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

    describe('getShopperDetails', () => {
        test('calls console.error if no checkoutSessionId is passed', () => {
            console.error = jest.fn();
            const amazonPay = getElement();
            amazonPay.getShopperDetails();
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
            await amazonPay.handleDeclineFlow();
            expect(window.location.assign).toHaveBeenCalledTimes(1);
        });
    });
});
