import { render, screen } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import userEvent from '@testing-library/user-event';
import Oxxo from './Oxxo';
import Language from '../../language';

test('should return expected data to perform the payment', () => {
    const oxxoElement = new Oxxo({});
    expect(oxxoElement.formatData()).toEqual({ paymentMethod: { type: 'oxxo' } });
});

test('should not show the pay button by default', () => {
    const oxxoElement = new Oxxo({});
    render(oxxoElement.render());
    expect(screen.queryByRole('button', { name: 'Continue to Oxxo' })).toBeNull();
    expect(oxxoElement.props.showPayButton).toBeFalsy();
});

test('should show pay button if property is set to true', async () => {
    const i18n = mock<Language>();
    i18n.get.mockImplementation(() => 'Continue to');
    i18n.loaded = Promise.resolve();

    const oxxoElement = new Oxxo({ showPayButton: true, i18n });

    render(oxxoElement.render());
    expect(await screen.findByRole('button', { name: 'Continue to Oxxo' })).toBeTruthy();
});

test('should trigger submit when Pay button is pressed', async () => {
    const user = userEvent.setup();
    const i18n = mock<Language>();
    i18n.get.mockImplementation(() => 'Continue to');
    i18n.loaded = Promise.resolve();

    const oxxoElement = new Oxxo({ showPayButton: true, i18n });
    oxxoElement.submit = jest.fn();

    render(oxxoElement.render());

    await user.click(await screen.findByRole('button', { name: 'Continue to Oxxo' }));
    expect(oxxoElement.submit).toHaveBeenCalledTimes(1);
});
