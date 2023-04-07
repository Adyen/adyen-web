import CashAppPay from './CashAppPay';
import { render, screen } from '@testing-library/preact';
import CashAppService from './services/CashAppService';
import { CashAppPayEventData } from './types';

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

test('should return grantId, cashTag, customerId and correct txVariant', () => {
    const grantId = 'xxxx-yyyy';
    const cashTag = '$johnny';
    const customerId = 'abcdef';

    const cashAppPayElement = new CashAppPay({});

    const data: CashAppPayEventData = {
        grantId,
        cashTag,
        customerId
    };

    cashAppPayElement.setState(data);

    expect(cashAppPayElement.formatData()).toEqual({ paymentMethod: { type: 'cashapp', grantId, cashTag, customerId } });
});

test('should initially display the loading spinner while SDK is being loaded', async () => {
    const cashAppPayElement = new CashAppPay({});
    render(cashAppPayElement.render());

    expect(CashAppService).toHaveBeenCalledTimes(1);
    expect(await screen.findByTestId('spinner')).toBeTruthy();
});

test('should create customer request and then begin CashApp flow when submit is triggered', async () => {
    const onClick = jest.fn().mockImplementation(actions => actions.resolve());
    const cashAppPayElement = new CashAppPay({ onClick });
    render(cashAppPayElement.render());

    cashAppPayElement.submit();

    expect(onClick).toHaveBeenCalledTimes(1);

    await new Promise(process.nextTick);

    expect(mockCreateCustomerRequest).toHaveBeenCalledTimes(1);
    expect(mockBegin).toHaveBeenCalledTimes(1);
});
