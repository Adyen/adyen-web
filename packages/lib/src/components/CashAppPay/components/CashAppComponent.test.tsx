import { h } from 'preact';
import { CashAppComponent } from './CashAppComponent';
import { mock } from 'jest-mock-extended';
import { render, waitFor } from '@testing-library/preact';
import { CashAppPayEvents, ICashAppService } from '../services/types';

test('should initialize the CashAppPay through the CashAppService', async () => {
    const service = mock<ICashAppService>();

    service.subscribeToEvent.mockImplementation(() => {
        return () => {};
    });

    const { unmount } = render(
        <CashAppComponent
            showPayButton={true}
            onChange={() => {}}
            onAuthorize={() => {}}
            ref={jest.fn()}
            onClick={jest.fn()}
            onError={jest.fn()}
            cashAppService={service}
        />
    );

    await waitFor(() => expect(service.initialize).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(service.renderButton).toHaveBeenCalledTimes(1));

    expect(service.subscribeToEvent.mock.calls[0][0]).toBe(CashAppPayEvents.CustomerDismissed);
    expect(service.subscribeToEvent.mock.calls[1][0]).toBe(CashAppPayEvents.CustomerRequestDeclined);
    expect(service.subscribeToEvent.mock.calls[2][0]).toBe(CashAppPayEvents.CustomerRequestApproved);
    expect(service.subscribeToEvent.mock.calls[3][0]).toBe(CashAppPayEvents.CustomerRequestFailed);

    unmount();

    expect(service.restart).toHaveBeenCalledTimes(1);
});

test('should call onAuthorize when customer request is approved', async () => {
    const grantId = 'xxxx-yyyy';
    const onFileGrantId = 'zzzz-wwww';
    const id = '#123456#';
    const cashtag = '$cashtag-id';

    const onAuthorized = jest.fn();
    const service = mock<ICashAppService>();

    service.subscribeToEvent.mockImplementation((eventType, cb) => {
        if (eventType === CashAppPayEvents.CustomerRequestApproved) {
            const cashAppApprovedObject = {
                customerProfile: { id, cashtag },
                grants: { payment: { grantId }, onFile: { grantId: onFileGrantId } }
            };
            cb(cashAppApprovedObject);
        }
        return () => {};
    });

    const expectedData = {
        customerId: id,
        cashTag: cashtag,
        grantId,
        onFileGrantId
    };

    render(
        <CashAppComponent
            ref={jest.fn()}
            onClick={jest.fn()}
            showPayButton={true}
            onChange={jest.fn()}
            onAuthorize={onAuthorized}
            onError={jest.fn()}
            cashAppService={service}
        />
    );

    await waitFor(() => expect(onAuthorized).toHaveBeenCalledTimes(1));
    expect(onAuthorized).toHaveBeenCalledWith(expectedData);
});

test('should call onError with error type CANCEL when customer dismiss the pop-up', async () => {
    const onError = jest.fn();
    const service = mock<ICashAppService>();

    service.subscribeToEvent.mockImplementation((eventType, cb) => {
        if (eventType === CashAppPayEvents.CustomerDismissed) {
            cb();
        }
        return () => {};
    });

    render(
        <CashAppComponent
            ref={jest.fn()}
            showPayButton={true}
            onAuthorize={jest.fn()}
            onClick={jest.fn()}
            onChange={jest.fn()}
            onError={onError}
            cashAppService={service}
        />
    );

    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    expect(onError.mock.calls[0][0].name).toBe('CANCEL');
});

test('should call onError with error type ERROR and CashApp is reinitialized when payment request is declined', async () => {
    const onError = jest.fn();
    const service = mock<ICashAppService>();

    service.subscribeToEvent.mockImplementation((eventType, cb) => {
        if (eventType === CashAppPayEvents.CustomerRequestDeclined) {
            cb();
        }
        return () => {};
    });

    render(
        <CashAppComponent
            ref={jest.fn()}
            showPayButton={true}
            onAuthorize={jest.fn()}
            onClick={jest.fn()}
            onChange={jest.fn()}
            onError={onError}
            cashAppService={service}
        />
    );

    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));

    expect(onError.mock.calls[0][0].name).toBe('ERROR');
    expect(service.restart).toHaveBeenCalledTimes(1);
    expect(service.renderButton).toHaveBeenCalledTimes(2);
});

test('should call onError with error type ERROR when customer request fails', async () => {
    const onError = jest.fn();
    const service = mock<ICashAppService>();

    service.subscribeToEvent.mockImplementation((eventType, cb) => {
        if (eventType === CashAppPayEvents.CustomerRequestFailed) {
            cb();
        }
        return () => {};
    });

    render(
        <CashAppComponent
            ref={jest.fn()}
            showPayButton={true}
            onAuthorize={jest.fn()}
            onClick={jest.fn()}
            onChange={jest.fn()}
            onError={onError}
            cashAppService={service}
        />
    );

    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    expect(onError.mock.calls[0][0].name).toBe('ERROR');
});
