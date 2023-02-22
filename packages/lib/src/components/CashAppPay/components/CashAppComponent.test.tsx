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

test('should call onSubmit when customer request is approved', async () => {
    const grantId = 'xxxx-yyyy';
    const onSubmit = jest.fn();
    const onError = jest.fn();
    const ref = jest.fn();
    const service = mock<ICashAppService>();

    service.subscribeToEvent.mockImplementation((eventType, cb) => {
        if (eventType === CashAppPayEvents.CustomerRequestApproved) {
            const cashAppApprovedObject = {
                grants: { payment: { grantId } }
            };
            cb(cashAppApprovedObject);
        }
        return () => {};
    });

    render(<CashAppComponent ref={ref} onSubmit={onSubmit} onError={onError} cashAppService={service} />);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(grantId);
});

test('should call onError with error type CANCEL when customer dismiss the pop-up', async () => {
    const onSubmit = jest.fn();
    const onError = jest.fn();
    const ref = jest.fn();
    const service = mock<ICashAppService>();

    service.subscribeToEvent.mockImplementation((eventType, cb) => {
        if (eventType === CashAppPayEvents.CustomerDismissed) {
            cb();
        }
        return () => {};
    });

    render(<CashAppComponent ref={ref} onSubmit={onSubmit} onError={onError} cashAppService={service} />);

    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    expect(onError.mock.calls[0][0].name).toBe('CANCEL');
});

test('should call onError with error type ERROR and CashApp is reinitialized when payment request is declined', async () => {
    const onSubmit = jest.fn();
    const onError = jest.fn();
    const ref = jest.fn();
    const service = mock<ICashAppService>();

    service.subscribeToEvent.mockImplementation((eventType, cb) => {
        if (eventType === CashAppPayEvents.CustomerRequestDeclined) {
            cb();
        }
        return () => {};
    });

    render(<CashAppComponent ref={ref} onSubmit={onSubmit} onError={onError} cashAppService={service} />);

    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    expect(onError.mock.calls[0][0].name).toBe('ERROR');
    expect(service.restart).toHaveBeenCalledTimes(1);
    expect(service.createCustomerRequest).toHaveBeenCalledTimes(2);
    expect(service.renderButton).toHaveBeenCalledTimes(2);
});

test('should call onError with error type ERROR when customer request fails', async () => {
    const onSubmit = jest.fn();
    const onError = jest.fn();
    const ref = jest.fn();
    const service = mock<ICashAppService>();

    service.subscribeToEvent.mockImplementation((eventType, cb) => {
        if (eventType === CashAppPayEvents.CustomerRequestFailed) {
            cb();
        }
        return () => {};
    });

    render(<CashAppComponent ref={ref} onSubmit={onSubmit} onError={onError} cashAppService={service} />);

    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    expect(onError.mock.calls[0][0].name).toBe('ERROR');
});
