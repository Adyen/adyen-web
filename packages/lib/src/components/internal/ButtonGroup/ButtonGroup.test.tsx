import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import ButtonGroup from './ButtonGroup';
import type { ComponentProps } from 'preact';

const options = [
    { label: '€0.50', value: 50, selected: false, disabled: false },
    { label: '€1.99', value: 199, selected: true, disabled: false },
    { label: '€3.00', value: 300, selected: false, disabled: true }
];

const renderButtonGroup = (props: Partial<Omit<ComponentProps<typeof ButtonGroup>, 'onChange'>> = {}) => {
    const onChange = jest.fn();
    render(<ButtonGroup options={options} name="amount" ariaLabel="Donation amount" {...props} onChange={onChange} />);
    return { onChange };
};

describe('ButtonGroup', () => {
    test('should expose the radios as a radio group with an accessible name', () => {
        renderButtonGroup();

        expect(screen.getByRole('radiogroup', { name: 'Donation amount' })).toBeTruthy();
    });

    test('should render a radio for each option, named by its label', () => {
        renderButtonGroup();

        expect(screen.getAllByRole('radio')).toHaveLength(3);
        expect(screen.getByRole('radio', { name: '€0.50' })).toBeTruthy();
    });

    test('should give all radios the same name so they behave as one group', () => {
        renderButtonGroup();

        screen.getAllByRole('radio').forEach(radio => expect(radio.getAttribute('name')).toBe('amount'));
    });

    test('should check only the selected option', () => {
        renderButtonGroup();

        expect(screen.getByRole<HTMLInputElement>('radio', { name: '€1.99' }).checked).toBe(true);
        expect(screen.getByRole<HTMLInputElement>('radio', { name: '€0.50' }).checked).toBe(false);
    });

    test('should call onChange with the option value when the label text is clicked', async () => {
        const user = userEvent.setup();
        const { onChange } = renderButtonGroup();

        await user.click(screen.getByText('€0.50'));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][0].target.value).toBe('50');
    });

    test('should not call onChange for a disabled option', async () => {
        const user = userEvent.setup();
        const { onChange } = renderButtonGroup();

        await user.click(screen.getByText('€3.00'));

        expect(onChange).not.toHaveBeenCalled();
    });
});
