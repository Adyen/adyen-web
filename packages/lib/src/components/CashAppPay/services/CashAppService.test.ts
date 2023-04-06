import { CashAppService } from './CashAppService';
import { ICashAppSdkLoader } from './CashAppSdkLoader';
import { mock } from 'jest-mock-extended';
import { CashAppPayEvents, CashAppServiceConfig, ICashAppSDK, ICashAppWindowObject } from './types';

const configuration: CashAppServiceConfig = {
    useCashAppButtonUi: true,
    storePaymentMethod: false,
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

    sdkLoader.load.mockResolvedValue(cashAppWindowObject);
    cashAppWindowObject.pay.mockResolvedValue(cashAppSdk);

    const service = new CashAppService(sdkLoader, configuration);
    await service.initialize();

    expect(sdkLoader.load).toBeCalledWith(configuration.environment);
    expect(cashAppWindowObject.pay).toBeCalledWith({ clientId: configuration.clientId });
});

test('should trigger the SDK button rendering', async () => {
    const sdkLoader = mock<ICashAppSdkLoader>();
    const cashAppWindowObject = mock<ICashAppWindowObject>();
    const cashAppSdk = mock<ICashAppSDK>();

    cashAppSdk.render.mockResolvedValue({ begin: () => {} });

    sdkLoader.load.mockResolvedValue(cashAppWindowObject);
    cashAppWindowObject.pay.mockResolvedValue(cashAppSdk);

    const divContainer = document.createElement('div');

    const service = new CashAppService(sdkLoader, configuration);
    await service.initialize();
    await service.renderButton(divContainer);

    expect(cashAppSdk.render).toBeCalledWith(divContainer, { button: { width: 'full', shape: 'semiround' }, manage: false });
});

test('should create a customer request with one time action', async () => {
    const sdkLoader = mock<ICashAppSdkLoader>();
    const cashAppWindowObject = mock<ICashAppWindowObject>();
    const cashAppSdk = mock<ICashAppSDK>();

    sdkLoader.load.mockResolvedValue(cashAppWindowObject);
    cashAppWindowObject.pay.mockResolvedValue(cashAppSdk);

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

test.skip('should create a customer request with on file action');

test.skip('should create a customer request with on file AND one time actions');

test.skip('should be able to enable/disable on file action (Scenario: user tick/untick store payment method checkbox');

test.skip('should trigger the CashAppPay flow');

test('should be able to restart the SDK', async () => {
    const sdkLoader = mock<ICashAppSdkLoader>();
    const cashAppWindowObject = mock<ICashAppWindowObject>();
    const cashAppSdk = mock<ICashAppSDK>();

    sdkLoader.load.mockResolvedValue(cashAppWindowObject);
    cashAppWindowObject.pay.mockResolvedValue(cashAppSdk);

    const service = new CashAppService(sdkLoader, configuration);
    await service.initialize();
    await service.restart();

    expect(cashAppSdk.restart).toHaveBeenCalledTimes(1);
});

test('should be able to subscribe/unsubscribe to CashAppSdk events', async () => {
    const sdkLoader = mock<ICashAppSdkLoader>();
    const cashAppWindowObject = mock<ICashAppWindowObject>();
    const cashAppSdk = mock<ICashAppSDK>();

    const onCustomerApprovedResponse = {
        grants: { payment: { grantId: 'xxxx' } }
    };

    cashAppWindowObject.pay.mockResolvedValue(cashAppSdk);
    sdkLoader.load.mockResolvedValue(cashAppWindowObject);
    cashAppSdk.addEventListener.mockImplementation((event: CashAppPayEvents, cb: Function) => {
        if (event === CashAppPayEvents.CustomerRequestApproved) {
            cb(onCustomerApprovedResponse);
        }
    });

    const service = new CashAppService(sdkLoader, configuration);
    await service.initialize();

    const handleRequestApproved = jest.fn();
    const unsubscribeFn = service.subscribeToEvent(CashAppPayEvents.CustomerRequestApproved, handleRequestApproved);

    expect(handleRequestApproved).toBeCalledWith(onCustomerApprovedResponse);
    expect(handleRequestApproved).toHaveBeenCalledTimes(1);

    unsubscribeFn();

    expect(cashAppSdk.removeEventListener).toBeCalledWith(CashAppPayEvents.CustomerRequestApproved, handleRequestApproved);
});
