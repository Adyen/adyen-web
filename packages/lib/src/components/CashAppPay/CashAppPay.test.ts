import CashAppPay from './CashAppPay';
import { render, screen } from '@testing-library/preact';
import { CashAppService } from './services/CashAppService';

jest.mock('./services/CashAppService');
jest.spyOn(CashAppService.prototype, 'subscribeToEvent').mockImplementation(() => () => {});

beforeEach(() => {
    // @ts-ignore 'mockClear' is provided by jest.mock
    CashAppService.mockClear();
});

test('should return grantId and correct txVariant', () => {
    const grantId = 'xxxx-yyyy';
    const cashAppPayElement = new CashAppPay({});
    cashAppPayElement.setState({ grantId });

    expect(cashAppPayElement.formatData()).toEqual({ paymentMethod: { type: 'cashapp', grantId } });
});

test('should trigger error if submit is called', () => {
    const onError = jest.fn();
    const cashAppPayElement = new CashAppPay({ onError });
    cashAppPayElement.submit();

    expect(onError).toHaveBeenCalledTimes(1);
});

test('should initially display the loading spinner while SDK is being loaded', async () => {
    const cashAppPayElement = new CashAppPay({});
    render(cashAppPayElement.render());

    expect(CashAppService).toHaveBeenCalledTimes(1);
    expect(await screen.findByTestId('spinner')).toBeTruthy();
});
