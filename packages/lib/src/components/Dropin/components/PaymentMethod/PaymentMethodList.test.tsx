import { ComponentChildren, h } from 'preact';
import PaymentMethodList from './PaymentMethodList';
import { render, screen, within } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import UIElement from '../../../internal/UIElement/UIElement';
import userEvent from '@testing-library/user-event';
import Giftcard from '../../../Giftcard';
import { Order, OrderStatus } from '../../../../types';
import CoreProvider from '../../../../core/Context/CoreProvider';

function createInstantPaymentMethods() {
    return [
        mock<UIElement>({
            props: {
                // id: '1',
                type: 'googlepay'
            },
            _id: 'scheme-123456',
            displayName: 'Google Pay',
            render: () => <button data-testid="instant-googlepay">Pay with Google Pay</button>
        }),
        mock<UIElement>({
            props: {
                // id: '1',
                type: 'applepay'
            },
            _id: 'scheme-123456',
            displayName: 'Apple Pay',
            render: () => <button data-testid="instant-applepay">Pay with Apple Pay</button>
        })
    ];
}

function createPaymentMethodsMock() {
    return [
        mock<UIElement>({
            props: {
                // id: '1',
                type: 'scheme'
            },
            _id: 'scheme-123456',
            displayName: 'Card'
        }),
        mock<UIElement>({
            props: {
                // id: '2',
                type: 'wechat'
            },
            _id: 'google-pay-123456',
            displayName: 'WeChat'
        }),
        mock<UIElement>({
            props: {
                // id: '2',
                type: 'pix'
            },
            _id: 'apple-pay-123456',
            displayName: 'Pix'
        })
    ];
}

const customRender = (children: ComponentChildren) => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            {children}
        </CoreProvider>
    );
};

test('onSelect should be triggered only once', async () => {
    const user = userEvent.setup();
    const paymentMethods = createPaymentMethodsMock();
    const onSelectMock = jest.fn();

    customRender(<PaymentMethodList paymentMethods={paymentMethods} cachedPaymentMethods={{}} isLoading={false} onSelect={onSelectMock} />);

    await user.click(await screen.findByRole('radio', { name: /Card/ }));
    await user.click(await screen.findByRole('radio', { name: /WeChat/ }));
    await user.click(await screen.findByRole('radio', { name: /Pix/ }));

    expect(onSelectMock).toHaveBeenCalledTimes(3);
});

test('should not call onSelect if there is no payment method', () => {
    const onSelectMock = jest.fn();

    customRender(
        <PaymentMethodList paymentMethods={[]} cachedPaymentMethods={{}} isLoading={false} onSelect={onSelectMock} openFirstPaymentMethod={true} />
    );

    expect(onSelectMock).toHaveBeenCalledTimes(0);
});

test('should call onSelect when mounting the Component if openFirstPaymentMethod is set', () => {
    const onSelectMock = jest.fn();
    const paymentMethods = createPaymentMethodsMock();

    customRender(
        <PaymentMethodList
            paymentMethods={paymentMethods}
            cachedPaymentMethods={{}}
            isLoading={false}
            onSelect={onSelectMock}
            openFirstPaymentMethod={true}
        />
    );

    expect(onSelectMock).toHaveBeenCalledTimes(2);
    expect(onSelectMock).toHaveBeenCalledWith(paymentMethods[0]);
});

test('should not call onSelect if openFirstStoredPaymentMethod is set but there is no oneClick payment', () => {
    const onSelectMock = jest.fn();
    const paymentMethods = createPaymentMethodsMock();

    customRender(
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

    customRender(
        <PaymentMethodList
            storedPaymentMethods={paymentMethods}
            cachedPaymentMethods={{}}
            isLoading={false}
            onSelect={onSelectMock}
            openFirstStoredPaymentMethod={true}
            paymentMethods={[]}
        />
    );

    expect(onSelectMock).toHaveBeenCalledTimes(1);
});

test('should display instant payment methods', () => {
    const instantPaymentMethods = createInstantPaymentMethods();
    const paymentMethods = createPaymentMethodsMock();

    customRender(
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

describe('Gift card', () => {
    let giftCardPayment;

    beforeEach(() => {
        const props = {
            id: '3',
            type: 'giftcard',
            brand: 'givex',
            oneClick: true,
            brandsConfiguration: {
                givex: { icon: 'https://example.com' }
            }
        };
        giftCardPayment = new Giftcard(global.core, props);
    });

    test('should display the gift card custom icon in the payment method list', async () => {
        customRender(
            <PaymentMethodList paymentMethods={[giftCardPayment]} cachedPaymentMethods={{}} isLoading={false} openFirstStoredPaymentMethod={true} />
        );
        const img = await screen.findByRole('img');
        // @ts-ignore img element contains src
        expect(img.src).toContain('https://example.com');
    });

    test('should display the gift card custom icon in the order payment section', async () => {
        const order: Order = { orderData: 'dummy', pspReference: 'dummyPsp' };
        const orderStatus: OrderStatus = {
            expiresAt: '2023-06-08T13:08:29.00Z',
            pspReference: 'dummyPsp',
            reference: 'dummyRef',
            paymentMethods: [{ lastFour: '0000', type: 'givex', amount: { currency: 'USD', value: 5000 } }],
            remainingAmount: { currency: 'USD', value: 20940 }
        };
        customRender(
            <PaymentMethodList
                order={order}
                orderStatus={orderStatus}
                paymentMethods={[giftCardPayment]}
                cachedPaymentMethods={{}}
                isLoading={false}
                openFirstStoredPaymentMethod={true}
            />
        );
        const orderHeader = await screen.findByText(/0000/);
        const img = await within(orderHeader).findByRole('img');
        // @ts-ignore img element contains src
        expect(img.src).toContain('https://example.com');
    });
});
