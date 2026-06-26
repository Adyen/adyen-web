import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { OrderPaymentMethods } from './OrderPaymentMethods';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { Order, OrderStatus } from '../../../../types';

const order: Order = { orderData: 'dummy', pspReference: 'dummyPsp' };

const baseOrderStatus: OrderStatus = {
    expiresAt: '2023-06-08T13:08:29.00Z',
    pspReference: 'dummyPsp',
    reference: 'dummyRef',
    paymentMethods: [],
    remainingAmount: { currency: 'EUR', value: 0 }
};

const customRender = (ui: h.JSX.Element) =>
    render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            {ui}
        </CoreProvider>
    );

describe('OrderPaymentMethods', () => {
    const user = userEvent.setup();

    describe('payment method display text', () => {
        test('shows masked last four digits when no label is provided', () => {
            const orderStatus: OrderStatus = {
                ...baseOrderStatus,
                paymentMethods: [{ type: 'visa', lastFour: '1234', amount: { currency: 'EUR', value: 5000 } }]
            };

            customRender(<OrderPaymentMethods order={order} orderStatus={orderStatus} onOrderCancel={jest.fn()} brandLogoConfiguration={{}} />);

            expect(screen.getByText('•••• 1234')).toBeInTheDocument();
        });

        test('shows label when label is provided', () => {
            const orderStatus: OrderStatus = {
                ...baseOrderStatus,
                paymentMethods: [{ type: 'paypal', label: 'user@example.com', amount: { currency: 'EUR', value: 5000 } }]
            };

            customRender(<OrderPaymentMethods order={order} orderStatus={orderStatus} onOrderCancel={jest.fn()} brandLogoConfiguration={{}} />);

            expect(screen.getByText('user@example.com')).toBeInTheDocument();
        });
    });

    describe('group div aria-label', () => {
        test('has aria-label with payment description when lastFour is present', () => {
            const orderStatus: OrderStatus = {
                ...baseOrderStatus,
                paymentMethods: [{ type: 'visa', name: 'Visa', lastFour: '1234', amount: { currency: 'EUR', value: 5000 } }]
            };

            const { container } = customRender(
                <OrderPaymentMethods order={order} orderStatus={orderStatus} onOrderCancel={jest.fn()} brandLogoConfiguration={{}} />
            );

            /* eslint-disable testing-library/no-container, testing-library/no-node-access */
            const group = container.querySelector('[role="group"]');
            expect(group).toHaveAttribute('aria-label', 'Visa ending in 1 2 3 4');
            /* eslint-enable testing-library/no-container, testing-library/no-node-access */
        });

        test('falls back to type when name is absent', () => {
            const orderStatus: OrderStatus = {
                ...baseOrderStatus,
                paymentMethods: [{ type: 'mc', lastFour: '5678', amount: { currency: 'EUR', value: 5000 } }]
            };

            const { container } = customRender(
                <OrderPaymentMethods order={order} orderStatus={orderStatus} onOrderCancel={jest.fn()} brandLogoConfiguration={{}} />
            );

            /* eslint-disable testing-library/no-container, testing-library/no-node-access */
            const group = container.querySelector('[role="group"]');
            expect(group).toHaveAttribute('aria-label', 'mc ending in 5 6 7 8');
            /* eslint-enable testing-library/no-container, testing-library/no-node-access */
        });

        test('has no aria-label when lastFour is absent', () => {
            const orderStatus: OrderStatus = {
                ...baseOrderStatus,
                paymentMethods: [{ type: 'paypal', label: 'PayPal', amount: { currency: 'EUR', value: 5000 } }]
            };

            const { container } = customRender(
                <OrderPaymentMethods order={order} orderStatus={orderStatus} onOrderCancel={jest.fn()} brandLogoConfiguration={{}} />
            );

            /* eslint-disable testing-library/no-container, testing-library/no-node-access */
            const group = container.querySelector('[role="group"]');
            expect(group).not.toHaveAttribute('aria-label');
            /* eslint-enable testing-library/no-container, testing-library/no-node-access */
        });
    });

    describe('remove button', () => {
        test('is rendered when onOrderCancel is provided', () => {
            const orderStatus: OrderStatus = {
                ...baseOrderStatus,
                paymentMethods: [{ type: 'visa', lastFour: '1234', amount: { currency: 'EUR', value: 5000 } }]
            };

            customRender(<OrderPaymentMethods order={order} orderStatus={orderStatus} onOrderCancel={jest.fn()} brandLogoConfiguration={{}} />);

            expect(screen.getByRole('button', { name: /Remove/i })).toBeInTheDocument();
        });

        test('calls onOrderCancel with the order when clicked', async () => {
            const onOrderCancel = jest.fn();
            const orderStatus: OrderStatus = {
                ...baseOrderStatus,
                paymentMethods: [{ type: 'visa', lastFour: '1234', amount: { currency: 'EUR', value: 5000 } }]
            };

            customRender(<OrderPaymentMethods order={order} orderStatus={orderStatus} onOrderCancel={onOrderCancel} brandLogoConfiguration={{}} />);

            await user.click(screen.getByRole('button', { name: /Remove/i }));

            expect(onOrderCancel).toHaveBeenCalledTimes(1);
            expect(onOrderCancel).toHaveBeenCalledWith({ order });
        });

        test('has aria-labelledby referencing group and button ids when lastFour is present', () => {
            const orderStatus: OrderStatus = {
                ...baseOrderStatus,
                paymentMethods: [{ type: 'visa', lastFour: '1234', amount: { currency: 'EUR', value: 5000 } }]
            };

            customRender(<OrderPaymentMethods order={order} orderStatus={orderStatus} onOrderCancel={jest.fn()} brandLogoConfiguration={{}} />);

            const button = screen.getByRole('button', { name: /Remove/i });
            expect(button).toHaveAttribute('aria-labelledby', 'order-payment-method-visa-0 order-payment-method-remove-visa-0');
        });

        test('has no aria-labelledby when lastFour is absent', () => {
            const orderStatus: OrderStatus = {
                ...baseOrderStatus,
                paymentMethods: [{ type: 'paypal', label: 'PayPal', amount: { currency: 'EUR', value: 5000 } }]
            };

            customRender(<OrderPaymentMethods order={order} orderStatus={orderStatus} onOrderCancel={jest.fn()} brandLogoConfiguration={{}} />);

            const button = screen.getByRole('button', { name: /Remove/i });
            expect(button).not.toHaveAttribute('aria-labelledby');
        });
    });

    describe('remaining amount', () => {
        test('shows the remaining amount paragraph when remainingAmount is present', () => {
            const orderStatus: OrderStatus = {
                ...baseOrderStatus,
                paymentMethods: [{ type: 'visa', lastFour: '1234', amount: { currency: 'EUR', value: 5000 } }],
                remainingAmount: { currency: 'EUR', value: 20000 }
            };

            customRender(<OrderPaymentMethods order={order} orderStatus={orderStatus} onOrderCancel={jest.fn()} brandLogoConfiguration={{}} />);

            expect(screen.getByText(/Select another payment method/i)).toBeInTheDocument();
        });
    });

    describe('multiple payment methods', () => {
        test('renders all payment methods in the list', () => {
            const orderStatus: OrderStatus = {
                ...baseOrderStatus,
                paymentMethods: [
                    { type: 'visa', lastFour: '1234', amount: { currency: 'EUR', value: 3000 } },
                    { type: 'mc', lastFour: '5678', amount: { currency: 'EUR', value: 2000 } }
                ]
            };

            customRender(<OrderPaymentMethods order={order} orderStatus={orderStatus} onOrderCancel={jest.fn()} brandLogoConfiguration={{}} />);

            expect(screen.getByText('•••• 1234')).toBeInTheDocument();
            expect(screen.getByText('•••• 5678')).toBeInTheDocument();
            expect(screen.getAllByRole('button', { name: /Remove/i })).toHaveLength(2);
        });
    });
});
