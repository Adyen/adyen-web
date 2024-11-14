import Boleto from './Boleto';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
    http.get('https://checkoutshopper-live.adyen.com/checkoutshopper/datasets/countries/en-US.json', () => {
        return HttpResponse.json([{ id: 'BR', name: 'Brazil' }]);
    }),
    http.get('https://checkoutshopper-live.adyen.com/checkoutshopper/datasets/states/BR/en-US.json', () => {
        return HttpResponse.json([
            { id: 'MG', name: 'Minas Gerais' },
            { id: 'SP', name: 'Sao Paulo' }
        ]);
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Boleto', () => {
    test('should make a Boleto payment', async () => {
        const user = userEvent.setup();

        const onSubmitMock = jest.fn();

        const boleto = new Boleto(global.core, {
            modules: { analytics: global.analytics, resources: global.resources },
            i18n: global.i18n,
            onSubmit: onSubmitMock,
            loadingContext: 'https://checkoutshopper-live.adyen.com/checkoutshopper/'
        });

        render(boleto.render());

        const firstNameInput = await screen.findByLabelText('First name');
        const lastNameInput = await screen.findByLabelText('Last name');
        const ssnInput = await screen.findByLabelText('CPF/CNPJ');
        const street = await screen.findByLabelText('Street');
        const houseNumber = await screen.findByLabelText('House number');
        const postalCode = await screen.findByLabelText('Postal code');
        const city = await screen.findByLabelText('City');
        const state = await screen.findByLabelText('State');

        await user.type(firstNameInput, 'Jose');
        await user.type(lastNameInput, 'Fernandez');
        await user.type(ssnInput, '364.977.983-82');
        await user.type(street, 'Avenida Paulista');
        await user.type(houseNumber, '182');
        await user.type(postalCode, '01311-920');
        await user.type(city, 'Sao Paulo');

        await user.click(state);
        await user.keyboard('[ArrowDown][Enter]');

        const button = await screen.findByRole('button', { name: 'Generate Boleto' });
        await user.click(button);

        expect(onSubmitMock).toHaveBeenCalledTimes(1);
        expect(onSubmitMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    paymentMethod: {
                        type: 'boletobancario',
                        checkoutAttemptId: 'fetch-checkoutAttemptId-failed'
                    },
                    billingAddress: {
                        city: 'Sao Paulo',
                        country: 'BR',
                        houseNumberOrName: '182',
                        postalCode: '01311-920',
                        stateOrProvince: 'MG',
                        street: 'Avenida Paulista'
                    },
                    shopperName: {
                        firstName: 'Jose',
                        lastName: 'Fernandez'
                    },
                    socialSecurityNumber: '36497798382',
                    clientStateDataIndicator: true
                }
            }),
            expect.anything(),
            expect.anything()
        );
    });

    test('should not submit a Boleto payment if the form in not valid', async () => {
        const user = userEvent.setup();

        const onSubmitMock = jest.fn();

        const boleto = new Boleto(global.core, {
            modules: { analytics: global.analytics, resources: global.resources },
            i18n: global.i18n,
            onSubmit: onSubmitMock,
            loadingContext: 'https://checkoutshopper-live.adyen.com/checkoutshopper/'
        });

        render(boleto.render());

        const button = await screen.findByRole('button', { name: 'Generate Boleto' });
        await user.click(button);

        expect(onSubmitMock).toHaveBeenCalledTimes(0);

        expect(screen.getByText('Enter your first name')).toBeInTheDocument();
        expect(screen.getByText('Enter your last name')).toBeInTheDocument();
        expect(screen.getByText('Enter a valid CPF/CNPJ number')).toBeInTheDocument();
        expect(screen.getByText('Enter the street')).toBeInTheDocument();
        expect(screen.getByText('Enter the house number')).toBeInTheDocument();
        expect(screen.getByText('Enter the postal code')).toBeInTheDocument();
        expect(screen.getByText('Enter the city')).toBeInTheDocument();
        expect(screen.getByText('Enter the state')).toBeInTheDocument();
    });

    test('should allow shoppers to send a copy to their email and make a Boleto payment', async () => {
        const user = userEvent.setup();

        const onSubmitMock = jest.fn();

        const boleto = new Boleto(global.core, {
            modules: { analytics: global.analytics, resources: global.resources },
            i18n: global.i18n,
            onSubmit: onSubmitMock,
            loadingContext: 'https://checkoutshopper-live.adyen.com/checkoutshopper/'
        });

        render(boleto.render());

        const firstNameInput = await screen.findByLabelText('First name');
        const lastNameInput = await screen.findByLabelText('Last name');
        const ssnInput = await screen.findByLabelText('CPF/CNPJ');
        const street = await screen.findByLabelText('Street');
        const houseNumber = await screen.findByLabelText('House number');
        const postalCode = await screen.findByLabelText('Postal code');
        const city = await screen.findByLabelText('City');
        const state = await screen.findByLabelText('State');

        await user.type(firstNameInput, 'Jose');
        await user.type(lastNameInput, 'Fernandez');
        await user.type(ssnInput, '364.977.983-82');
        await user.type(street, 'Avenida Paulista');
        await user.type(houseNumber, '182');
        await user.type(postalCode, '01311-920');
        await user.type(city, 'Sao Paulo');

        await user.click(state);
        await user.keyboard('[ArrowDown][Enter]');

        const emailCheckbox = await screen.findByRole('checkbox', { name: 'Send a copy to my email' });
        await user.click(emailCheckbox);

        const email = await screen.findByLabelText('Email address');
        await user.type(email, 'jose@adyen.com');

        const button = await screen.findByRole('button', { name: 'Generate Boleto' });
        await user.click(button);

        expect(onSubmitMock).toHaveBeenCalledTimes(1);
        expect(onSubmitMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    paymentMethod: {
                        type: 'boletobancario',
                        checkoutAttemptId: 'fetch-checkoutAttemptId-failed'
                    },
                    billingAddress: {
                        city: 'Sao Paulo',
                        country: 'BR',
                        houseNumberOrName: '182',
                        postalCode: '01311-920',
                        stateOrProvince: 'MG',
                        street: 'Avenida Paulista'
                    },
                    shopperName: {
                        firstName: 'Jose',
                        lastName: 'Fernandez'
                    },
                    shopperEmail: 'jose@adyen.com',
                    socialSecurityNumber: '36497798382',
                    clientStateDataIndicator: true
                }
            }),
            expect.anything(),
            expect.anything()
        );
    });
});
