import Pix from './Pix';
import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';

test('should return only payment type if personalDetails is not required', () => {
    const pixElement = new Pix(global.core);
    expect(pixElement.data).toEqual({ clientStateDataIndicator: true, paymentMethod: { type: 'pix', checkoutAttemptId: 'do-not-track' } });
});

test('should show personal details form if enabled', async () => {
    const i18n = global.i18n;
    const pixElement = new Pix(global.core, {
        personalDetailsRequired: true,
        i18n,
        loadingContext: 'ggg',
        modules: { resources: global.resources }
    });
    render(pixElement.render());

    expect(await screen.findByLabelText('First name')).toBeTruthy();
    expect(await screen.findByLabelText('Last name')).toBeTruthy();
    expect(await screen.findByLabelText('CPF/CNPJ')).toBeTruthy();
});

test('should show pay button by default', async () => {
    const i18n = global.i18n;
    const pixElement = new Pix(global.core, { i18n, loadingContext: 'ggg', modules: { resources: global.resources } });
    render(pixElement.render());

    expect(await screen.findByRole('button', { name: 'Continue to pix' })).toBeTruthy();
});

test('should validate Brazil SSN', async () => {
    const user = userEvent.setup();
    const i18n = global.i18n;
    const pixElement = new Pix(global.core, {
        personalDetailsRequired: true,
        i18n,
        loadingContext: 'ggg',
        modules: { resources: global.resources }
    });
    render(pixElement.render());

    const firstNameInput = await screen.findByLabelText('First name');
    const lastNameInput = await screen.findByLabelText('Last name');
    const ssnInput = await screen.findByLabelText('CPF/CNPJ');

    await user.type(firstNameInput, 'Jose');
    await user.type(lastNameInput, 'Fernandez');
    await user.type(ssnInput, '18839203');

    pixElement.submit();

    await waitFor(() => expect(ssnInput).toBeInvalid());

    await user.clear(ssnInput);
    await user.type(ssnInput, '81943004790');

    await waitFor(() => expect(ssnInput).toBeValid());
});

test('should trigger submit when Pay button is pressed', async () => {
    const user = userEvent.setup();
    const i18n = global.i18n;
    const pixElement = new Pix(global.core, { i18n, loadingContext: 'ggg', modules: { resources: global.resources } });
    pixElement.submit = jest.fn();
    render(pixElement.render());

    await user.click(await screen.findByRole('button', { name: 'Continue to pix' }));
    expect(pixElement.submit).toHaveBeenCalledTimes(1);
});
