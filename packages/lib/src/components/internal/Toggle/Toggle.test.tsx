import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import Toggle from './Toggle';

test('should emit correct values', async () => {
    const user = userEvent.setup();
    const onChangeMock = jest.fn();

    render(<Toggle checked={false} onChange={onChangeMock} />);

    await user.click(screen.getByRole('switch'));
    expect(onChangeMock.mock.calls[0][0]).toBe(true);

    await user.click(screen.getByRole('switch'));
    expect(onChangeMock.mock.calls[1][0]).toBe(false);
});

test('should render as readonly', () => {
    render(<Toggle checked={false} readonly />);
    expect(screen.getByRole('switch').getAttribute('aria-readonly')).toBe('true');
});

test('should render as disabled', () => {
    render(<Toggle checked={false} disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
});

test('should render description', () => {
    render(<Toggle checked={false} label="Save details" description="Save all details" />);
    expect(screen.getByText('Save all details')).toBeTruthy();
});
