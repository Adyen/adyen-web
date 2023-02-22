import { h } from 'preact';
import { CashAppComponent } from './CashAppComponent';
import { mock } from 'jest-mock-extended';
import { render, waitFor } from '@testing-library/preact';
import { CashAppPayEvents, ICashAppService } from '../services/types';

test('should initialize the CashAppPay through the CashAppService', async () => {
    const onSubmit = jest.fn();
    const onError = jest.fn();
    const ref = jest.fn();
    const service = mock<ICashAppService>();

    service.subscribeToEvent.mockImplementation(() => {
        return () => {};
    });

    const { unmount } = render(<CashAppComponent ref={ref} onSubmit={onSubmit} onError={onError} cashAppService={service} />);

    await waitFor(() => expect(service.initialize).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(service.createCustomerRequest).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(service.renderButton).toHaveBeenCalledTimes(1));

    expect(service.subscribeToEvent.mock.calls[0][0]).toBe(CashAppPayEvents.CustomerDismissed);
    expect(service.subscribeToEvent.mock.calls[1][0]).toBe(CashAppPayEvents.CustomerRequestDeclined);
    expect(service.subscribeToEvent.mock.calls[2][0]).toBe(CashAppPayEvents.CustomerRequestApproved);
    expect(service.subscribeToEvent.mock.calls[3][0]).toBe(CashAppPayEvents.CustomerRequestFailed);

    unmount();

    expect(service.restart).toHaveBeenCalledTimes(1);
});
