import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import StoreDetails from './StoreDetails';

test('StoredDetails defaults to false, toggles to true', async () => {
    const user = userEvent.setup();

    const onChangeMock = jest.fn();
    render(<StoreDetails onChange={onChangeMock} />);
    const checkbox = await screen.findByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
});

test('StoredDetails storeDetails prop true does nothing LEGACY TEST', async () => {
    // I wanted to capture this buggy feature,
    const user = userEvent.setup();

    const onChangeMock = jest.fn();
    render(<StoreDetails storeDetails={true} onChange={onChangeMock} />);
    const checkbox = await screen.findByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
});
