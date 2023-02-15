import { CashAppService } from './CashAppService';
import { ICashAppSdkLoader } from './CashAppSdkLoader';
import { mock } from 'jest-mock-extended';
import { CashAppPayEvents, CashAppServiceConfig, ICashAppSDK, ICashAppWindowObject } from './types';

const configuration: CashAppServiceConfig = {
    referenceId: 'shopper-identifier',
    redirectURL: window.location.href,
    environment: 'test',
    clientId: 'xxxx',
    scopeId: 'zzzz',
    amount: { value: 1000, currency: 'USD' }
};

test('should initialize the CashAppPay SDK', async () => {
    const sdkLoader = mock<ICashAppSdkLoader>();
    const cashAppWindowObject = mock<ICashAppWindowObject>();
    const cashAppSdk = mock<ICashAppSDK>();

    cashAppWindowObject.pay.mockResolvedValue(cashAppSdk);
    sdkLoader.load.mockResolvedValue(cashAppWindowObject);

    const service = new CashAppService(sdkLoader, configuration);
    await service.initialize();

    expect(sdkLoader.load).toBeCalledWith(configuration.environment);
    expect(cashAppWindowObject.pay).toBeCalledWith({ clientId: configuration.clientId });
});

test('should trigger the button rendering', async () => {
    const sdkLoader = mock<ICashAppSdkLoader>();
    const cashAppWindowObject = mock<ICashAppWindowObject>();
    const cashAppSdk = mock<ICashAppSDK>();

    cashAppWindowObject.pay.mockResolvedValue(cashAppSdk);
    sdkLoader.load.mockResolvedValue(cashAppWindowObject);

    const divContainer = document.createElement('div');

    const service = new CashAppService(sdkLoader, configuration);
    await service.initialize();
    await service.renderButton(divContainer);

    expect(cashAppSdk.render).toBeCalledWith(divContainer, { button: { width: 'full', shape: 'semiround' } });
});

test('should create customer request', async () => {
    const sdkLoader = mock<ICashAppSdkLoader>();
    const cashAppWindowObject = mock<ICashAppWindowObject>();
    const cashAppSdk = mock<ICashAppSDK>();

    cashAppWindowObject.pay.mockResolvedValue(cashAppSdk);
    sdkLoader.load.mockResolvedValue(cashAppWindowObject);

    const service = new CashAppService(sdkLoader, configuration);
    await service.initialize();
    await service.createCustomerRequest();

    expect(cashAppSdk.customerRequest).toBeCalledWith({
        referenceId: configuration.referenceId,
        redirectURL: configuration.redirectURL,
        actions: {
            payment: {
                amount: configuration.amount,
                scopeId: configuration.scopeId
            }
        }
    });
});

test('should be able to restart the SDK', async () => {
    const sdkLoader = mock<ICashAppSdkLoader>();
    const cashAppWindowObject = mock<ICashAppWindowObject>();
    const cashAppSdk = mock<ICashAppSDK>();

    cashAppWindowObject.pay.mockResolvedValue(cashAppSdk);
    sdkLoader.load.mockResolvedValue(cashAppWindowObject);

    const service = new CashAppService(sdkLoader, configuration);
    await service.initialize();
    await service.restart();

    expect(cashAppSdk.restart).toHaveBeenCalledTimes(1);
});

test('should trigger proper callback when CashAppSdk fires an event', async () => {
    const sdkLoader = mock<ICashAppSdkLoader>();
    const cashAppWindowObject = mock<ICashAppWindowObject>();
    const cashAppSdk = mock<ICashAppSDK>();

    cashAppWindowObject.pay.mockResolvedValue(cashAppSdk);
    sdkLoader.load.mockResolvedValue(cashAppWindowObject);

    const service = new CashAppService(sdkLoader, configuration);
    await service.initialize();

    const handleRequestApproved = jest.fn();

    service.subscribeToEvent(CashAppPayEvents.CustomerRequestApproved, handleRequestApproved);
});
