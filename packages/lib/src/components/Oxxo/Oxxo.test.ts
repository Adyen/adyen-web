import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import Oxxo from './Oxxo';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

describe('Oxxo', () => {
    test('should return expected data to perform the payment', () => {
        const oxxo = new Oxxo(global.core);
        expect(oxxo.formatData()).toEqual({ paymentMethod: { type: 'oxxo' } });
    });

    test('should show pay button by default', async () => {
        const core = setupCoreMock();

        const oxxo = new Oxxo(core, {
            loadingContext: 'test',
            i18n: global.i18n,
            modules: { resources: global.resources }
        });

        render(oxxo.render());
        expect(await screen.findByRole('button', { name: 'Continue to Oxxo' })).toBeTruthy();
    });

    test('should trigger submit when Pay button is pressed', async () => {
        const user = userEvent.setup();
        const core = setupCoreMock();

        const oxxo = new Oxxo(core, {
            loadingContext: 'test',
            i18n: global.i18n,
            modules: { resources: global.resources }
        });
        oxxo.submit = jest.fn();

        render(oxxo.render());

        await user.click(await screen.findByRole('button', { name: 'Continue to Oxxo' }));
        expect(oxxo.submit).toHaveBeenCalledTimes(1);
    });

    test('should show reference when reference is provided', async () => {
        const core = setupCoreMock();

        const oxxo = new Oxxo(core, {
            loadingContext: 'test',
            i18n: global.i18n,
            modules: { resources: global.resources },
            reference: 'test-reference'
        });

        render(oxxo.render());

        expect(await screen.findByText('test-reference')).toBeInTheDocument();
    });
});
