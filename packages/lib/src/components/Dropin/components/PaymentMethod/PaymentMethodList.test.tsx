import { ComponentChildren, h } from 'preact';
import PaymentMethodList from './PaymentMethodList';
import { render, screen, within } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import UIElement from '../../../internal/UIElement/UIElement';
import userEvent from '@testing-library/user-event';
import Giftcard from '../../../Giftcard';
import { Order, OrderStatus } from '../../../../types';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { setupCoreMock } from '../../../../../config/testMocks/setup-core-mock';
import type { ICore } from '../../../../core/types';

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

const core = setupCoreMock();

const customRender = (children: ComponentChildren) => {
    return render(
        <CoreProvider i18n={core.modules.i18n} loadingContext="test" resources={core.modules.resources}>
            {children}
        </CoreProvider>
    );
};

test('onSelect should be triggered only once', async () => {
    const user = userEvent.setup();
    const paymentMethods = createPaymentMethodsMock();
    const onSelectMock = jest.fn();

    customRender(<PaymentMethodList paymentMethods={paymentMethods} isLoading={false} onSelect={onSelectMock} />);

    await user.click(await screen.findByRole('radio', { name: /Card/ }));
    await user.click(await screen.findByRole('radio', { name: /WeChat/ }));
    await user.click(await screen.findByRole('radio', { name: /Pix/ }));

    expect(onSelectMock).toHaveBeenCalledTimes(3);
});

test('should not call onSelect if there is no payment method', () => {
    const onSelectMock = jest.fn();

    customRender(<PaymentMethodList paymentMethods={[]} isLoading={false} onSelect={onSelectMock} openFirstPaymentMethod={true} />);

    expect(onSelectMock).toHaveBeenCalledTimes(0);
});

test('should call onSelect when mounting the Component if openFirstPaymentMethod is set', () => {
    const onSelectMock = jest.fn();
    const paymentMethods = createPaymentMethodsMock();

    customRender(<PaymentMethodList paymentMethods={paymentMethods} isLoading={false} onSelect={onSelectMock} openFirstPaymentMethod={true} />);

    expect(onSelectMock).toHaveBeenCalledTimes(1);
    expect(onSelectMock).toHaveBeenCalledWith(paymentMethods[0]);
});

test('should not call onSelect if openFirstStoredPaymentMethod is set but there is no oneClick payment', () => {
    const onSelectMock = jest.fn();
    const paymentMethods = createPaymentMethodsMock();

    customRender(<PaymentMethodList paymentMethods={paymentMethods} isLoading={false} onSelect={onSelectMock} openFirstStoredPaymentMethod={true} />);

    expect(onSelectMock).toHaveBeenCalledTimes(0);
});

test('should call onSelect if openFirstStoredPaymentMethod is set and there is no oneClick payment', () => {
    const onSelectMock = jest.fn();
    const paymentMethods = createPaymentMethodsMock();
    paymentMethods[0].props.oneClick = true;

    customRender(
        <PaymentMethodList
            storedPaymentMethods={paymentMethods}
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
            isLoading={false}
            openFirstStoredPaymentMethod={true}
        />
    );

    expect(screen.getByTestId('instant-googlepay')).toBeVisible();
    expect(screen.getByTestId('instant-applepay')).toBeVisible();
});

describe('Keyboard navigation with a single payment method in one of the lists', () => {
    const createStoredCardMock = (lastFour = '1234') =>
        mock<UIElement>({
            props: { type: 'scheme', oneClick: true },
            _id: `stored-visa-${lastFour}`,
            displayName: `•••• ${lastFour}`
        });

    test('should render a focusable radio for a single stored payment method when other payment methods exist', async () => {
        const user = userEvent.setup();
        const storedPaymentMethod = createStoredCardMock();
        const onSelectMock = jest.fn();

        customRender(
            <PaymentMethodList
                storedPaymentMethods={[storedPaymentMethod]}
                paymentMethods={createPaymentMethodsMock()}
                activePaymentMethod={createPaymentMethodsMock()[0]}
                isLoading={false}
                onSelect={onSelectMock}
            />
        );

        const storedRadio = screen.getByRole('radio', { name: /1234/ });

        await user.tab();
        expect(storedRadio).toHaveFocus();

        await user.keyboard('{Enter}');
        expect(onSelectMock).toHaveBeenCalledWith(storedPaymentMethod);
    });

    test('should allow shift+tab to move back to a single stored payment method from the other payment methods', async () => {
        const user = userEvent.setup();
        const paymentMethods = createPaymentMethodsMock();

        customRender(
            <PaymentMethodList
                storedPaymentMethods={[createStoredCardMock()]}
                paymentMethods={paymentMethods}
                activePaymentMethod={paymentMethods[0]}
                isLoading={false}
            />
        );

        screen.getByRole('radio', { name: /Card/ }).focus();
        await user.tab({ shift: true });

        expect(screen.getByRole('radio', { name: /1234/ })).toHaveFocus();
    });

    test('should render a focusable radio for a single regular payment method when stored payment methods exist', () => {
        const storedPaymentMethods = [createStoredCardMock('1234'), createStoredCardMock('5678')];
        const [singlePaymentMethod] = createPaymentMethodsMock();

        customRender(
            <PaymentMethodList
                storedPaymentMethods={storedPaymentMethods}
                paymentMethods={[singlePaymentMethod]}
                activePaymentMethod={storedPaymentMethods[0]}
                isLoading={false}
            />
        );

        expect(screen.getByRole('radio', { name: /Card/ })).toBeInTheDocument();
    });

    test('should not render a radio when there is only one payment method in the whole list', () => {
        const [singlePaymentMethod] = createPaymentMethodsMock();

        customRender(<PaymentMethodList paymentMethods={[singlePaymentMethod]} isLoading={false} />);

        expect(screen.queryByRole('radio')).not.toBeInTheDocument();
        expect(screen.getByText('Card')).toBeInTheDocument();
    });

    test('should not render a radio when the only payment method is a single stored one', () => {
        customRender(<PaymentMethodList storedPaymentMethods={[createStoredCardMock()]} paymentMethods={[]} isLoading={false} />);

        expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    });
});

describe('Gift card', () => {
    let giftCardPayment: Giftcard;
    let giftCardCore: ICore;

    beforeEach(() => {
        giftCardCore = setupCoreMock();
        const props = {
            id: '3',
            type: 'giftcard',
            brand: 'givex',
            oneClick: true,
            brandsConfiguration: {
                givex: { icon: 'https://example.com' }
            }
        };
        giftCardPayment = new Giftcard(giftCardCore, props);
    });

    test('should display the gift card custom icon in the payment method list', async () => {
        customRender(<PaymentMethodList paymentMethods={[giftCardPayment]} isLoading={false} openFirstStoredPaymentMethod={true} />);
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
