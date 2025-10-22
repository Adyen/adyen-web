import CashAppPay from './CashAppPay';
import { render, screen } from '@testing-library/preact';
import CashAppService from './services/CashAppService';
import { CashAppPayEventData } from './types';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

jest.mock('./services/CashAppService');
jest.spyOn(CashAppService.prototype, 'subscribeToEvent').mockImplementation(() => () => {});
const mockCreateCustomerRequest = jest.spyOn(CashAppService.prototype, 'createCustomerRequest').mockResolvedValue();
const mockBegin = jest.spyOn(CashAppService.prototype, 'begin').mockImplementation();

beforeEach(() => {
    // @ts-ignore 'mockClear' is provided by jest.mock
    CashAppService.mockClear();
    mockCreateCustomerRequest.mockClear();
    mockBegin.mockClear();
});

test('should return on-file data if available', () => {
    const onFileGrantId = 'xxxx-yyyy';
    const customerId = 'abcdef';
    const cashTag = '$john-doe';
    const core = setupCoreMock();

    const cashAppPayElement = new CashAppPay(core, { storePaymentMethod: true });

    const data: CashAppPayEventData = {
        onFileGrantId,
        cashTag,
        customerId
    };

    cashAppPayElement.setState({ data });

    expect(cashAppPayElement.formatData()).toEqual({
        paymentMethod: { type: 'cashapp', onFileGrantId, customerId, cashtag: cashTag },
        storePaymentMethod: true
    });
});

test('should return grantId, customerId and correct txVariant', () => {
    const grantId = 'xxxx-yyyy';
    const customerId = 'abcdef';
    const core = setupCoreMock();

    const cashAppPayElement = new CashAppPay(core);

    const data: CashAppPayEventData = {
        grantId,
        customerId
    };

    cashAppPayElement.setState({ data });

    expect(cashAppPayElement.formatData()).toEqual({ paymentMethod: { type: 'cashapp', grantId, customerId } });
});

test('should initially display the loading spinner while SDK is being loaded', async () => {
    const core = setupCoreMock();

    const cashAppPayElement = new CashAppPay(core, {
        i18n: global.i18n,
        loadingContext: 'test',
        modules: { resources: global.resources }
    });
    render(cashAppPayElement.render());

    expect(CashAppService).toHaveBeenCalledTimes(1);
    expect(await screen.findByTestId('spinner')).toBeTruthy();
});

test('should create customer request and then begin CashApp flow when submit is triggered', async () => {
    const onClick = jest.fn().mockImplementation(actions => actions.resolve());
    const core = setupCoreMock();

    const cashAppPayElement = new CashAppPay(core, {
        onClick,
        i18n: global.i18n,
        loadingContext: 'test',
        modules: { resources: global.resources }
    });
    render(cashAppPayElement.render());

    cashAppPayElement.submit();

    expect(onClick).toHaveBeenCalledTimes(1);

    await new Promise(process.nextTick);

    expect(mockCreateCustomerRequest).toHaveBeenCalledTimes(1);
    expect(mockBegin).toHaveBeenCalledTimes(1);
});
