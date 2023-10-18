import { mock } from 'jest-mock-extended';
import { ClickToPayElement } from './ClickToPay';
import { ClickToPayConfiguration } from '../internal/ClickToPay/types';
import createClickToPayService from '../internal/ClickToPay/services/create-clicktopay-service';
import { ClickToPayCheckoutPayload, IClickToPayService } from '../internal/ClickToPay/services/types';
import { CtpState } from '../internal/ClickToPay/services/ClickToPayService';

jest.mock('../internal/ClickToPay/services/create-clicktopay-service');

test('should initialize ClickToPayService when creating the element', () => {
    const mockCtpService = mock<IClickToPayService>();
    mockCtpService.initialize.mockImplementation(() => Promise.resolve());
    // @ts-ignore mockImplementation not inferred
    createClickToPayService.mockImplementation(() => mockCtpService);

    const configuration = {
        visaSrcInitiatorId: '$123456$',
        visaSrciDpaId: '$654321$'
    };
    const ctpConfiguration: ClickToPayConfiguration = {
        shopperEmail: 'shopper@example.com'
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const element = new ClickToPayElement({ core: global.core, environment: 'test', configuration, ...ctpConfiguration });

    expect(createClickToPayService).toHaveBeenCalledWith(configuration, ctpConfiguration, 'test');
    expect(mockCtpService.initialize).toHaveBeenCalledTimes(1);
});

test('should formatData() to click to pay /payment request format', () => {
    const paymentDataReceivedFromScheme: ClickToPayCheckoutPayload = {
        srcDigitalCardId: '$123456$',
        srcCorrelationId: '$654321$',
        srcScheme: 'mc'
    };

    const element = new ClickToPayElement({ core: global.core });
    element.setState({ data: paymentDataReceivedFromScheme });

    const data = element.formatData();

    expect(data).toEqual(
        expect.objectContaining({
            paymentMethod: {
                type: 'clicktopay',
                srcDigitalCardId: paymentDataReceivedFromScheme.srcDigitalCardId,
                srcCorrelationId: paymentDataReceivedFromScheme.srcCorrelationId,
                srcScheme: paymentDataReceivedFromScheme.srcScheme
            }
        })
    );
    expect(data.browserInfo).toBeDefined();
    expect(data.origin).toBeDefined();
});

test('should get shopperEmail from session if available', () => {
    global.core.options = {
        session: {
            shopperEmail: 'shopper@example.com'
        }
    };

    const element = new ClickToPayElement({ core: global.core });

    expect(element.props.shopperEmail).toBe('shopper@example.com');
});

test('should resolve isAvailable if shopper account is found', async () => {
    const mockCtpService = mock<IClickToPayService>();
    mockCtpService.initialize.mockImplementation(() => Promise.resolve());
    // @ts-ignore mockImplementation not inferred
    createClickToPayService.mockImplementation(() => mockCtpService);

    Object.defineProperty(mockCtpService, 'shopperAccountFound', {
        get: jest.fn(() => true)
    });

    const element = new ClickToPayElement({ core: global.core });

    await expect(element.isAvailable()).resolves.not.toThrow();
});

test('should reject isAvailable if shopper account is not found', async () => {
    const mockCtpService = mock<IClickToPayService>();
    mockCtpService.initialize.mockImplementation(() => Promise.resolve());
    // @ts-ignore mockImplementation not inferred
    createClickToPayService.mockImplementation(() => mockCtpService);

    mockCtpService.subscribeOnStateChange.mockImplementation(callback => {
        callback(CtpState.NotAvailable);
    });

    Object.defineProperty(mockCtpService, 'shopperAccountFound', {
        get: jest.fn(() => false)
    });

    const element = new ClickToPayElement({ core: global.core });

    await expect(element.isAvailable()).rejects.toBeFalsy();
});
