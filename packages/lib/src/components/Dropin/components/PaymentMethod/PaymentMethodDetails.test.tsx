import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import { useState } from 'preact/hooks';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';

import { PaymentMethodDetails } from './PaymentMethodDetails';
import UIElement from '../../../internal/UIElement/UIElement';

function StatefulInput({ testId }: Readonly<{ testId: string }>) {
    const [value, setValue] = useState('');
    return <input data-testid={testId} value={value} onInput={event => setValue((event.target as HTMLInputElement).value)} />;
}

function createPaymentMethodMock(id: string) {
    return mock<UIElement>({ type: 'scheme', _id: id, render: jest.fn(() => <StatefulInput testId={`${id}-input`} />) });
}

/** Mimics Drop-in list, where at most one payment method is selected at a time */
function PaymentMethodListWrapper({ paymentMethodComponents }: Readonly<{ paymentMethodComponents: UIElement[] }>) {
    const [selected, setSelected] = useState<UIElement>(null);
    return (
        <div>
            {paymentMethodComponents.map(paymentMethodComponent => (
                <div key={paymentMethodComponent._id}>
                    <button onClick={() => setSelected(selected === paymentMethodComponent ? null : paymentMethodComponent)}>
                        {`toggle ${paymentMethodComponent._id}`}
                    </button>
                    <PaymentMethodDetails paymentMethodComponent={paymentMethodComponent} isSelected={selected === paymentMethodComponent} />
                </div>
            ))}
        </div>
    );
}

test('should not render the payment method until it gets selected', async () => {
    const user = userEvent.setup();
    const paymentMethod = createPaymentMethodMock('card');

    render(<PaymentMethodListWrapper paymentMethodComponents={[paymentMethod]} />);

    expect(paymentMethod.render).not.toHaveBeenCalled();
    expect(screen.queryByTestId('card-input')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'toggle card' }));

    expect(paymentMethod.render).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('card-input')).toBeVisible();
});

test('should reuse the previous render, keeping the payment method state, when it gets deselected', async () => {
    const user = userEvent.setup();
    const paymentMethod = createPaymentMethodMock('card');

    render(<PaymentMethodListWrapper paymentMethodComponents={[paymentMethod]} />);

    await user.click(screen.getByRole('button', { name: 'toggle card' }));
    await user.type(screen.getByTestId('card-input'), 'hello');

    // deselect
    await user.click(screen.getByRole('button', { name: 'toggle card' }));

    expect(paymentMethod.render).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('card-input')).toHaveValue('hello');
});

test('should render again, keeping the payment method state, when it gets selected once more', async () => {
    const user = userEvent.setup();
    const paymentMethod = createPaymentMethodMock('card');

    render(<PaymentMethodListWrapper paymentMethodComponents={[paymentMethod]} />);

    await user.click(screen.getByRole('button', { name: 'toggle card' }));
    await user.type(screen.getByTestId('card-input'), 'hello');

    // deselect and select again
    await user.click(screen.getByRole('button', { name: 'toggle card' }));
    await user.click(screen.getByRole('button', { name: 'toggle card' }));

    expect(paymentMethod.render).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('card-input')).toHaveValue('hello');
});

test('should keep the state of the first payment method after selecting the other ones and coming back to it', async () => {
    const user = userEvent.setup();
    const paymentMethods = ['first', 'second', 'third'].map(createPaymentMethodMock);

    render(<PaymentMethodListWrapper paymentMethodComponents={paymentMethods} />);

    await user.click(screen.getByRole('button', { name: 'toggle first' }));
    await user.type(screen.getByTestId('first-input'), 'hello');

    await user.click(screen.getByRole('button', { name: 'toggle second' }));
    await user.click(screen.getByRole('button', { name: 'toggle third' }));
    await user.click(screen.getByRole('button', { name: 'toggle first' }));

    expect(screen.getByTestId('first-input')).toHaveValue('hello');
    expect(screen.getByTestId('second-input')).toHaveValue('');
    expect(screen.getByTestId('third-input')).toHaveValue('');
});
