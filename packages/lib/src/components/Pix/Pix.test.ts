import Pix from './Pix';
import { render, screen } from '@testing-library/preact';
import { mock } from 'jest-mock-extended';
import userEvent from '@testing-library/user-event';
import Language from '../../language';
test('should return only payment type if personalDetails is not required', async () => {
    const pixElement = new Pix({});
    expect(pixElement.formatData()).toEqual({ paymentMethod: { type: 'pix' } });
});

test('should show personal details form if enabled', async () => {
    const i18n = mock<Language>();
    i18n.get.mockImplementation(key => {
        if (key === 'firstName') return 'First name';
        if (key === 'lastName') return 'Last name';
        if (key === 'boleto.socialSecurityNumber') return 'CPF/CNPJ';
        if (key === 'continueTo') return 'Continue to';
    });

    i18n.loaded = Promise.resolve();

    const pixElement = new Pix({ personalDetailsRequired: true, i18n });
    render(pixElement.render());

    expect(await screen.findByLabelText('First name')).toBeTruthy();
    expect(await screen.findByLabelText('Last name')).toBeTruthy();
    expect(await screen.findByLabelText('CPF/CNPJ')).toBeTruthy();
});

test('should show pay button if property is set to true', async () => {
    const i18n = mock<Language>();
    i18n.loaded = Promise.resolve();
    i18n.get.mockImplementation(key => {
        if (key === 'continueTo') return 'Continue to';
    });

    const pixElement = new Pix({ showPayButton: true, i18n });
    render(pixElement.render());

    expect(await screen.findByRole('button', { name: 'Continue to pix' })).toBeTruthy();
});

test.only('should validate Brazil SSN', async () => {
    const user = userEvent.setup({ delay: 150 });

    const i18n = mock<Language>();
    i18n.loaded = Promise.resolve();
    i18n.get.mockImplementation(key => {
        if (key === 'firstName') return 'First name';
        if (key === 'lastName') return 'Last name';
        if (key === 'boleto.socialSecurityNumber') return 'CPF/CNPJ';
        if (key === 'continueTo') return 'Continue to';
    });

    const pixElement = new Pix({ personalDetailsRequired: true, showPayButton: true, i18n });
    render(pixElement.render());

    user.type(await screen.findByLabelText('First name'), 'Jose');
    user.type(await screen.findByLabelText('Last name'), 'Fernandez');
    user.type(await screen.findByLabelText('CPF/CNPJ'), '18839203');

    console.log(pixElement.formatData());

    expect(await screen.findByRole('button', { name: 'Continue to pix' })).toBeTruthy();
});
