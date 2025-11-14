import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import Oxxo from './Oxxo';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

test('should return expected data to perform the payment', () => {
    const oxxoElement = new Oxxo(global.core);
    expect(oxxoElement.formatData()).toEqual({ paymentMethod: { type: 'oxxo' } });
});

test('should show pay button by default', async () => {
    const core = setupCoreMock();

    const oxxoElement = new Oxxo(core, {
        loadingContext: 'test',
        i18n: global.i18n,
        modules: { resources: global.resources }
    });

    render(oxxoElement.render());
    expect(await screen.findByRole('button', { name: 'Continue to Oxxo' })).toBeTruthy();
});

test('should trigger submit when Pay button is pressed', async () => {
    const user = userEvent.setup();
    const core = setupCoreMock();

    const oxxoElement = new Oxxo(core, {
        loadingContext: 'test',
        i18n: global.i18n,
        modules: { resources: global.resources }
    });
    oxxoElement.submit = jest.fn();

    render(oxxoElement.render());

    await user.click(await screen.findByRole('button', { name: 'Continue to Oxxo' }));
    expect(oxxoElement.submit).toHaveBeenCalledTimes(1);
});
