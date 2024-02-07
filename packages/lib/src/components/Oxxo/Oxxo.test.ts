import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import Oxxo from './Oxxo';

test('should return expected data to perform the payment', () => {
    const oxxoElement = new Oxxo(global.core);
    expect(oxxoElement.formatData()).toEqual({ paymentMethod: { type: 'oxxo' } });
});

test('should show pay button if property is set to true', async () => {
    const oxxoElement = new Oxxo(global.core, {
        loadingContext: 'test',
        showPayButton: true,
        i18n: global.i18n,
        modules: { resources: global.resources }
    });

    render(oxxoElement.render());
    expect(await screen.findByRole('button', { name: 'Continue to Oxxo' })).toBeTruthy();
});

test('should trigger submit when Pay button is pressed', async () => {
    const user = userEvent.setup();

    const oxxoElement = new Oxxo(global.core, {
        loadingContext: 'test',
        showPayButton: true,
        i18n: global.i18n,
        modules: { resources: global.resources }
    });
    oxxoElement.submit = jest.fn();

    render(oxxoElement.render());

    await user.click(await screen.findByRole('button', { name: 'Continue to Oxxo' }));
    expect(oxxoElement.submit).toHaveBeenCalledTimes(1);
});
