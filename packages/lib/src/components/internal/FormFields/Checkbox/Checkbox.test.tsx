import { h } from 'preact';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import Checkbox from './Checkbox';

describe('Checkbox', () => {
    const renderCheckbox = props => render(<Checkbox {...props} />);

    test('Renders a checkbox with a label', () => {
        renderCheckbox({ name: 'name', value: 'value', label: 'label' });
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox.className).toContain('adyen-checkout__checkbox__input');
        expect(checkbox.getAttribute('value')).toBe('value');
        expect(checkbox.getAttribute('name')).toBe('name');
        expect(screen.getByText('label').className).toContain('adyen-checkout__checkbox__label');
    });

    test('Calls onChange', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        renderCheckbox({ name: 'name', value: 'value', onChange });

        await user.click(screen.getByRole('checkbox'));
        expect(onChange).toHaveBeenCalledTimes(1);
    });
});
