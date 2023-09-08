import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import StoreDetails from './StoreDetails';

test('StoredDetails defaults to false, toggles to true', async () => {
    const user = userEvent.setup();
    let value;

    const onChangeMock = jest.fn(event => (value = event));
    render(<StoreDetails onChange={onChangeMock} />);
    const checkbox = await screen.findByRole('checkbox');
    // check for the checked status in the DOM
    expect(checkbox).not.toBeChecked();
    // also check for the emitted value from onChange
    expect(value).toBe(false);

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(value).toBe(true);
});

test('StoredDetails storeDetails prop true does nothing LEGACY TEST', async () => {
    // I wanted to capture this buggy feature,
    const user = userEvent.setup();
    let value;

    const onChangeMock = jest.fn(event => (value = event));
    render(<StoreDetails storeDetails={true} onChange={onChangeMock} />);
    const checkbox = await screen.findByRole('checkbox');
    // buggy behaviour should be fixed, but we improve test coverage before that
    // the checkbox will not be visibly "checked"
    expect(checkbox).not.toBeChecked();
    // correct behaviour
    expect(value).toBe(true);

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    // it will emit "true" again because it will start reading the DOM
    expect(value).toBe(true);

    await user.click(checkbox);
    // now it's all correct
    expect(checkbox).not.toBeChecked();
    expect(value).toBe(false);
});
