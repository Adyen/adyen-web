import { h } from 'preact';
import PaymentMethodList from './PaymentMethodList';
import { render, screen } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import UIElement from '../../../UIElement';
import EventEmitter from '../../../EventEmitter';
import userEvent from '@testing-library/user-event';

function createInstantPaymentMethods() {
    return [
        mock<UIElement>({
            props: {
                id: '1',
                type: 'googlepay'
            },
            _id: 'scheme-123456',
            displayName: 'Google Pay',
            eventEmitter: mock<EventEmitter>(),
            render: () => <button data-testid="instant-googlepay">Pay with Google Pay</button>
        }),
        mock<UIElement>({
            props: {
                id: '1',
                type: 'applepay'
            },
            _id: 'scheme-123456',
            displayName: 'Apple Pay',
            eventEmitter: mock<EventEmitter>(),
            render: () => <button data-testid="instant-applepay">Pay with Apple Pay</button>
        })
    ];
}

function createPaymentMethodsMock() {
    return [
        mock<UIElement>({
            props: {
                id: '1',
                type: 'scheme'
            },
            _id: 'scheme-123456',
            displayName: 'Card',
            eventEmitter: mock<EventEmitter>()
        }),
        mock<UIElement>({
            props: {
                id: '2',
                type: 'wechat'
            },
            _id: 'google-pay-123456',
            displayName: 'WeChat',
            eventEmitter: mock<EventEmitter>()
        }),
        mock<UIElement>({
            props: {
                id: '2',
                type: 'pix'
            },
            _id: 'apple-pay-123456',
            displayName: 'Pix',
            eventEmitter: mock<EventEmitter>()
        })
    ];
}

test('onSelect should be triggered only once', async () => {
    const user = userEvent.setup();
    const paymentMethods = createPaymentMethodsMock();
    const onSelectMock = jest.fn();

    render(<PaymentMethodList paymentMethods={paymentMethods} cachedPaymentMethods={{}} isLoading={false} onSelect={onSelectMock} />);

    await user.click(await screen.findByRole('radio', { name: /Card/ }));
    await user.click(await screen.findByRole('radio', { name: /WeChat/ }));
    await user.click(await screen.findByRole('radio', { name: /Pix/ }));

    expect(onSelectMock).toHaveBeenCalledTimes(3);
});

test('should not call onSelect if there is no payment method', () => {
    const onSelectMock = jest.fn();

    render(
        <PaymentMethodList paymentMethods={[]} cachedPaymentMethods={{}} isLoading={false} onSelect={onSelectMock} openFirstPaymentMethod={true} />
    );

    expect(onSelectMock).toHaveBeenCalledTimes(0);
});

test('should call onSelect when mounting the Component if openFirstPaymentMethod is set', () => {
    const onSelectMock = jest.fn();
    const paymentMethods = createPaymentMethodsMock();

    render(
        <PaymentMethodList
            paymentMethods={paymentMethods}
            cachedPaymentMethods={{}}
            isLoading={false}
            onSelect={onSelectMock}
            openFirstPaymentMethod={true}
        />
    );

    expect(onSelectMock).toHaveBeenCalledTimes(1);
    expect(onSelectMock).toHaveBeenCalledWith(paymentMethods[0]);
});

test('should not call onSelect if openFirstStoredPaymentMethod is set but there is no oneClick payment', () => {
    const onSelectMock = jest.fn();
    const paymentMethods = createPaymentMethodsMock();

    render(
        <PaymentMethodList
            paymentMethods={paymentMethods}
            cachedPaymentMethods={{}}
            isLoading={false}
            onSelect={onSelectMock}
            openFirstStoredPaymentMethod={true}
        />
    );

    expect(onSelectMock).toHaveBeenCalledTimes(0);
});

test('should call onSelect if openFirstStoredPaymentMethod is set and there is no oneClick payment', () => {
    const onSelectMock = jest.fn();
    const paymentMethods = createPaymentMethodsMock();
    paymentMethods[0].props.oneClick = true;

    render(
        <PaymentMethodList
            paymentMethods={paymentMethods}
            cachedPaymentMethods={{}}
            isLoading={false}
            onSelect={onSelectMock}
            openFirstStoredPaymentMethod={true}
        />
    );

    expect(onSelectMock).toHaveBeenCalledTimes(1);
});

test('should display instant payment methods', () => {
    const instantPaymentMethods = createInstantPaymentMethods();
    const paymentMethods = createPaymentMethodsMock();

    render(
        <PaymentMethodList
            paymentMethods={paymentMethods}
            instantPaymentMethods={instantPaymentMethods}
            cachedPaymentMethods={{}}
            isLoading={false}
            openFirstStoredPaymentMethod={true}
        />
    );

    expect(screen.getByTestId('instant-googlepay')).toBeVisible();
    expect(screen.getByTestId('instant-applepay')).toBeVisible();
});
