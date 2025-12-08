import RatePayDirectDebit from './RatePayDirectDebit';
import { render, screen, waitFor, within } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

const server = setupServer(
    http.get('https://checkoutshopper-live.adyen.com/checkoutshopper/datasets/countries/en-US.json', () => {
        return HttpResponse.json([{ id: 'DE', name: 'Germany' }]);
    }) as any
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('RatePay Direct Debit', () => {
    test('should make a payment', async () => {
        const user = userEvent.setup();
        const onSubmitMock = jest.fn();
        const onChangeMock = jest.fn();
        const core = setupCoreMock();

        const ratepay = new RatePayDirectDebit(core, {
            countryCode: 'DE',
            modules: { resources: global.resources },
            i18n: global.i18n,
            onSubmit: onSubmitMock,
            onChange: onChangeMock,
            loadingContext: 'https://checkoutshopper-live.adyen.com/checkoutshopper/'
        });

        render(ratepay.render());

        const firstNameInput = await screen.findByLabelText('First name');
        const lastNameInput = await screen.findByLabelText('Last name');
        const dateOfBirthInput = await screen.findByLabelText('Date of birth');
        const emailAddressInput = await screen.findByLabelText('Email address');
        const telephoneNumberInput = await screen.findByLabelText('Telephone number');

        const holderNameInput = await screen.findByLabelText('Holder Name');
        const accountNumberInput = await screen.findByLabelText('Account Number (IBAN)');

        const streetInput = await screen.findByLabelText('Street');
        const houseNumberInput = await screen.findByLabelText('House number');
        const postalCodeInput = await screen.findByLabelText('Postal code');
        const cityInput = await screen.findByLabelText('City');

        // Personal details
        await user.type(firstNameInput, 'Jose');
        await user.type(lastNameInput, 'Fernandez');
        await waitFor(() => {
            expect(onChangeMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ shopperName: { firstName: 'Jose', lastName: 'Fernandez' } })
                }),
                expect.anything()
            );
        });
        await user.type(dateOfBirthInput, '1990-01-01');
        await waitFor(() => {
            expect(onChangeMock).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: expect.objectContaining({ dateOfBirth: '1990-01-01' }) }),
                expect.anything()
            );
        });
        await user.type(emailAddressInput, 'jose@adyen.com');
        await waitFor(() => {
            expect(onChangeMock).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: expect.objectContaining({ shopperEmail: 'jose@adyen.com' }) }),
                expect.anything()
            );
        });
        await user.type(telephoneNumberInput, '612345678');
        await waitFor(() => {
            expect(onChangeMock).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: expect.objectContaining({ telephoneNumber: '612345678' }) }),
                expect.anything()
            );
        });

        // Bank account
        await user.type(holderNameInput, 'A. Schneider');
        await user.type(accountNumberInput, 'DE87123456781234567890');
        await waitFor(() => {
            expect(onChangeMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        bankAccount: { countryCode: 'DE', iban: 'DE87 1234 5678 1234 5678 90', ownerName: 'A. Schneider' }
                    })
                }),
                expect.anything()
            );
        });

        // Billing address
        await user.type(streetInput, 'Lichtenberger Str');
        await user.type(houseNumberInput, '100000');
        await user.type(postalCodeInput, '10179');
        await user.type(cityInput, 'Berlin');
        await waitFor(() => {
            expect(onChangeMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        billingAddress: {
                            country: 'DE',
                            stateOrProvince: 'N/A',
                            street: 'Lichtenberger Str',
                            houseNumberOrName: '100000',
                            postalCode: '10179',
                            city: 'Berlin'
                        }
                    })
                }),
                expect.anything()
            );
        });

        const payButton = await screen.findByRole('button', { name: 'Confirm purchase' });
        await user.click(payButton);

        await waitFor(() => {
            expect(onSubmitMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: {
                        bankAccount: { countryCode: 'DE', iban: 'DE87 1234 5678 1234 5678 90', ownerName: 'A. Schneider' },
                        billingAddress: {
                            city: 'Berlin',
                            country: 'DE',
                            houseNumberOrName: '100000',
                            postalCode: '10179',
                            stateOrProvince: 'N/A',
                            street: 'Lichtenberger Str'
                        },
                        clientStateDataIndicator: true,
                        dateOfBirth: '1990-01-01',
                        deliveryAddress: {
                            city: 'Berlin',
                            country: 'DE',
                            houseNumberOrName: '100000',
                            postalCode: '10179',
                            stateOrProvince: 'N/A',
                            street: 'Lichtenberger Str'
                        },
                        paymentMethod: { checkoutAttemptId: 'fetch-checkoutAttemptId-failed', type: 'ratepay_directdebit' },
                        shopperEmail: 'jose@adyen.com',
                        shopperName: { firstName: 'Jose', lastName: 'Fernandez' },
                        telephoneNumber: '612345678'
                    },
                    isValid: true
                }),
                expect.anything(),
                expect.anything()
            );
        });
    });

    test('should send a different delivery address when checking the checkbox', async () => {
        const user = userEvent.setup();
        const onSubmitMock = jest.fn();
        const onChangeMock = jest.fn();
        const core = setupCoreMock();

        const ratepay = new RatePayDirectDebit(core, {
            countryCode: 'DE',
            modules: { resources: global.resources },
            i18n: global.i18n,
            onSubmit: onSubmitMock,
            onChange: onChangeMock,
            loadingContext: 'https://checkoutshopper-live.adyen.com/checkoutshopper/'
        });

        const { container } = render(ratepay.render());

        const firstNameInput = await screen.findByLabelText('First name');
        const lastNameInput = await screen.findByLabelText('Last name');
        const dateOfBirthInput = await screen.findByLabelText('Date of birth');
        const emailAddressInput = await screen.findByLabelText('Email address');
        const telephoneNumberInput = await screen.findByLabelText('Telephone number');

        const holderNameInput = await screen.findByLabelText('Holder Name');
        const accountNumberInput = await screen.findByLabelText('Account Number (IBAN)');

        const streetInput = await screen.findByLabelText('Street');
        const houseNumberInput = await screen.findByLabelText('House number');
        const postalCodeInput = await screen.findByLabelText('Postal code');
        const cityInput = await screen.findByLabelText('City');

        // Personal details
        await user.type(firstNameInput, 'Jose');
        await user.type(lastNameInput, 'Fernandez');
        await waitFor(() => {
            expect(onChangeMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ shopperName: { firstName: 'Jose', lastName: 'Fernandez' } })
                }),
                expect.anything()
            );
        });

        await user.type(dateOfBirthInput, '1990-01-01');
        await waitFor(() => {
            expect(onChangeMock).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: expect.objectContaining({ dateOfBirth: '1990-01-01' }) }),
                expect.anything()
            );
        });
        await user.type(emailAddressInput, 'jose@adyen.com');
        await waitFor(() => {
            expect(onChangeMock).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: expect.objectContaining({ shopperEmail: 'jose@adyen.com' }) }),
                expect.anything()
            );
        });
        await user.type(telephoneNumberInput, '612345678');
        await waitFor(() => {
            expect(onChangeMock).toHaveBeenLastCalledWith(
                expect.objectContaining({ data: expect.objectContaining({ telephoneNumber: '612345678' }) }),
                expect.anything()
            );
        });

        // Bank account
        await user.type(holderNameInput, 'A. Schneider');
        await user.type(accountNumberInput, 'DE87123456781234567890');
        await waitFor(() => {
            expect(onChangeMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        bankAccount: { countryCode: 'DE', iban: 'DE87 1234 5678 1234 5678 90', ownerName: 'A. Schneider' }
                    })
                }),
                expect.anything()
            );
        });

        // Billing address
        await user.type(streetInput, 'Lichtenberger Str');
        await user.type(houseNumberInput, '100000');
        await user.type(postalCodeInput, '10179');
        await user.type(cityInput, 'Berlin');
        await waitFor(() => {
            expect(onChangeMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        billingAddress: {
                            country: 'DE',
                            stateOrProvince: 'N/A',
                            street: 'Lichtenberger Str',
                            houseNumberOrName: '100000',
                            postalCode: '10179',
                            city: 'Berlin'
                        }
                    })
                }),
                expect.anything()
            );
        });

        const deliveryAddressCheckbox = await screen.findByRole('checkbox', { name: 'Specify a separate delivery address' });
        await user.click(deliveryAddressCheckbox);
        await waitFor(() => {
            expect(onChangeMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        deliveryAddress: {
                            country: 'DE',
                            stateOrProvince: 'N/A'
                        }
                    })
                }),
                expect.anything()
            );
        });

        // eslint-disable-next-line testing-library/no-node-access,testing-library/no-container
        const [deliveryAddressSection] = container.querySelectorAll('.adyen-checkout__fieldset--deliveryAddress');

        const deliveryStreetInput = await within(<HTMLElement>deliveryAddressSection).findByLabelText('Street');
        const deliveryHouseNumberInput = await within(<HTMLElement>deliveryAddressSection).findByLabelText('House number');
        const deliveryPostalCodeInput = await within(<HTMLElement>deliveryAddressSection).findByLabelText('Postal code');
        const deliveryCityInput = await within(<HTMLElement>deliveryAddressSection).findByLabelText('City');

        // Delivery address
        await user.type(deliveryStreetInput, 'Carmilgestraat');
        await user.type(deliveryHouseNumberInput, '62813');
        await user.type(deliveryPostalCodeInput, '00089');
        await user.type(deliveryCityInput, 'Berlin');
        await waitFor(() => {
            expect(onChangeMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        deliveryAddress: {
                            city: 'Berlin',
                            country: 'DE',
                            houseNumberOrName: '62813',
                            postalCode: '00089',
                            stateOrProvince: 'N/A',
                            street: 'Carmilgestraat'
                        }
                    })
                }),
                expect.anything()
            );
        });

        const payButton = await screen.findByRole('button', { name: 'Confirm purchase' });
        await user.click(payButton);

        await waitFor(() => {
            expect(onSubmitMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: {
                        bankAccount: { countryCode: 'DE', iban: 'DE87 1234 5678 1234 5678 90', ownerName: 'A. Schneider' },
                        billingAddress: {
                            city: 'Berlin',
                            country: 'DE',
                            houseNumberOrName: '100000',
                            postalCode: '10179',
                            stateOrProvince: 'N/A',
                            street: 'Lichtenberger Str'
                        },
                        clientStateDataIndicator: true,
                        dateOfBirth: '1990-01-01',
                        deliveryAddress: {
                            city: 'Berlin',
                            country: 'DE',
                            houseNumberOrName: '62813',
                            postalCode: '00089',
                            stateOrProvince: 'N/A',
                            street: 'Carmilgestraat'
                        },
                        paymentMethod: { checkoutAttemptId: 'fetch-checkoutAttemptId-failed', type: 'ratepay_directdebit' },
                        shopperEmail: 'jose@adyen.com',
                        shopperName: { firstName: 'Jose', lastName: 'Fernandez' },
                        telephoneNumber: '612345678'
                    },
                    isValid: true
                }),
                expect.anything(),
                expect.anything()
            );
        });
    });

    test('should not submit the payment if form is not valid', async () => {
        const user = userEvent.setup();
        const core = setupCoreMock();
        const onSubmitMock = jest.fn();

        const ratepay = new RatePayDirectDebit(core, {
            countryCode: 'DE',
            modules: { resources: global.resources },
            i18n: global.i18n,
            onSubmit: onSubmitMock,
            loadingContext: 'https://checkoutshopper-live.adyen.com/checkoutshopper/'
        });

        render(ratepay.render());

        const payButton = await screen.findByRole('button', { name: 'Confirm purchase' });
        await user.click(payButton);

        expect(onSubmitMock).toHaveBeenCalledTimes(0);

        expect(screen.getByText('Enter your first name')).toBeInTheDocument();
        expect(screen.getByText('Enter your last name')).toBeInTheDocument();
        expect(screen.getByText('Enter the date of birth')).toBeInTheDocument();
        expect(screen.getByText('Enter the email address')).toBeInTheDocument();
        expect(screen.getByText('Enter the telephone number')).toBeInTheDocument();
        expect(screen.getByText('Invalid account holder name')).toBeInTheDocument();
        expect(screen.getByText('Invalid account number')).toBeInTheDocument();
        expect(screen.getByText('Enter the street')).toBeInTheDocument();
        expect(screen.getByText('Enter the house number')).toBeInTheDocument();
        expect(screen.getByText('Enter the postal code')).toBeInTheDocument();
        expect(screen.getByText('Enter the city')).toBeInTheDocument();
    });
});
