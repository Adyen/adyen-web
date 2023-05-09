import { mock } from 'jest-mock-extended';
import { ClickToPayElement } from './ClickToPay';
import { ClickToPayConfiguration } from '../internal/ClickToPay/types';
import createClickToPayService from '../internal/ClickToPay/services/create-clicktopay-service';
import { ClickToPayCheckoutPayload, IClickToPayService } from '../internal/ClickToPay/services/types';
import { CtpState } from '../internal/ClickToPay/services/ClickToPayService';

jest.mock('../internal/ClickToPay/services/create-clicktopay-service');

test('should initialize ClickToPayService when creating the element', () => {
    const mockCtpService = mock<IClickToPayService>();
    // @ts-ignore mockImplementation not inferred
    createClickToPayService.mockImplementation(() => mockCtpService);

    const configuration = {
        visaSrcInitiatorId: '$123456$',
        visaSrciDpaId: '$654321$'
    };
    const ctpConfiguration: ClickToPayConfiguration = {
        shopperEmail: 'shopper@example.com'
    };

    new ClickToPayElement({ environment: 'test', configuration, ...ctpConfiguration });

    expect(createClickToPayService).toHaveBeenCalledWith(configuration, ctpConfiguration, 'test');
    expect(mockCtpService.initialize).toHaveBeenCalledTimes(1);
});

test('should formatData() to click to pay /payment request format', () => {
    const paymentDataReceivedFromScheme: ClickToPayCheckoutPayload = {
        srcDigitalCardId: '$123456$',
        srcCorrelationId: '$654321$',
        srcScheme: 'mc'
    };

    const element = new ClickToPayElement({});
    element.setState({ data: paymentDataReceivedFromScheme });

    expect(element.formatData()).toEqual({
        paymentMethod: {
            type: 'clicktopay',
            srcDigitalCardId: paymentDataReceivedFromScheme.srcDigitalCardId,
            srcCorrelationId: paymentDataReceivedFromScheme.srcCorrelationId,
            srcScheme: paymentDataReceivedFromScheme.srcScheme
        },
        browserInfo: {
            acceptHeader: '*/*',
            colorDepth: 24,
            javaEnabled: false,
            language: 'en-US',
            screenHeight: '',
            screenWidth: '',
            timeZoneOffset: 300,
            userAgent: 'Mozilla/5.0 (linux) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/20.0.3'
        },
        origin: 'http://localhost'
    });
});

test('should get shopperEmail from session if available', () => {
    const props = {
        _parentInstance: {
            options: {
                session: {
                    shopperEmail: 'shopper@example.com'
                }
            }
        }
    };

    const element = new ClickToPayElement(props);

    expect(element.props.shopperEmail).toBe('shopper@example.com');
});

test('should resolve isAvailable if shopper account is found', async () => {
    const mockCtpService = mock<IClickToPayService>();
    // @ts-ignore mockImplementation not inferred
    createClickToPayService.mockImplementation(() => mockCtpService);

    Object.defineProperty(mockCtpService, 'shopperAccountFound', {
        get: jest.fn(() => true)
    });

    const element = new ClickToPayElement({});

    await expect(element.isAvailable()).resolves.toBeTruthy();
});

test('should reject isAvailable if shopper account is not found', async () => {
    const mockCtpService = mock<IClickToPayService>();
    // @ts-ignore mockImplementation not inferred
    createClickToPayService.mockImplementation(() => mockCtpService);

    mockCtpService.subscribeOnStateChange.mockImplementation(callback => {
        callback(CtpState.NotAvailable);
    });

    Object.defineProperty(mockCtpService, 'shopperAccountFound', {
        get: jest.fn(() => false)
    });

    const element = new ClickToPayElement({});

    await expect(element.isAvailable()).rejects.toBeFalsy();
});
