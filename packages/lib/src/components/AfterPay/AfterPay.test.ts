import AfterPay from './AfterPay';
import { render, screen, within } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
    http.get('https://checkoutshopper-live.adyen.com/checkoutshopper/datasets/countries/en-US.json', () => {
        return HttpResponse.json([{ id: 'NL', name: 'Netherlands' }]);
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AfterPay', () => {
    test('should make a payment', async () => {
        const user = userEvent.setup();
        const onSubmitMock = jest.fn();

        const afterpay = new AfterPay(global.core, {
            countryCode: 'NL',
            modules: { analytics: global.analytics, resources: global.resources, srPanel: global.srPanel },
            i18n: global.i18n,
            onSubmit: onSubmitMock,
            loadingContext: 'https://checkoutshopper-live.adyen.com/checkoutshopper/'
        });

        render(afterpay.render());

        const firstNameInput = await screen.findByLabelText('First name');
        const lastNameInput = await screen.findByLabelText('Last name');
        const maleRadioInput = await screen.findByLabelText('Male');
        const dateOfBirthInput = await screen.findByLabelText('Date of birth');
        const emailAddressInput = await screen.findByLabelText('Email address');
        const telephoneNumberInput = await screen.findByLabelText('Telephone number');

        const streetInput = await screen.findByLabelText('Street');
        const houseNumberInput = await screen.findByLabelText('House number');
        const postalCodeInput = await screen.findByLabelText('Postal code');
        const cityInput = await screen.findByLabelText('City');

        // Personal details
        await user.type(firstNameInput, 'Jose');
        await user.type(lastNameInput, 'Fernandez');
        await user.click(maleRadioInput);
        await user.type(dateOfBirthInput, '1990-01-01');
        await user.type(emailAddressInput, 'jose@adyen.com');
        await user.type(telephoneNumberInput, '612345678');

        // Billing address
        await user.type(streetInput, 'Simon Carmilgestraat');
        await user.type(houseNumberInput, '100000');
        await user.type(postalCodeInput, '1011DJ');
        await user.type(cityInput, 'Amsterdam');

        const termsAndConditionsCheckbox = await screen.findByRole('checkbox', {
            name: /I agree with the payment conditions of Riverty/i
        });
        await user.click(termsAndConditionsCheckbox);

        const payButton = await screen.findByRole('button', { name: 'Confirm purchase' });
        await user.click(payButton);

        expect(onSubmitMock).toHaveBeenCalledTimes(1);
        expect(onSubmitMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    billingAddress: {
                        city: 'Amsterdam',
                        country: 'NL',
                        houseNumberOrName: '100000',
                        postalCode: '1011DJ',
                        stateOrProvince: 'N/A',
                        street: 'Simon Carmilgestraat'
                    },
                    clientStateDataIndicator: true,
                    dateOfBirth: '1990-01-01',
                    deliveryAddress: {
                        city: 'Amsterdam',
                        country: 'NL',
                        houseNumberOrName: '100000',
                        postalCode: '1011DJ',
                        stateOrProvince: 'N/A',
                        street: 'Simon Carmilgestraat'
                    },
                    paymentMethod: { checkoutAttemptId: 'fetch-checkoutAttemptId-failed', type: 'afterpay_default' },
                    shopperEmail: 'jose@adyen.com',
                    shopperName: { firstName: 'Jose', gender: 'MALE', lastName: 'Fernandez' },
                    telephoneNumber: '612345678'
                },
                isValid: true
            }),
            expect.anything(),
            expect.anything()
        );
    });

    test('should send a different delivery address when checking the checkbox', async () => {
        const user = userEvent.setup();
        const onSubmitMock = jest.fn();

        const afterpay = new AfterPay(global.core, {
            countryCode: 'NL',
            modules: { analytics: global.analytics, resources: global.resources, srPanel: global.srPanel },
            i18n: global.i18n,
            onSubmit: onSubmitMock,
            loadingContext: 'https://checkoutshopper-live.adyen.com/checkoutshopper/'
        });

        const { container } = render(afterpay.render());

        const firstNameInput = await screen.findByLabelText('First name');
        const lastNameInput = await screen.findByLabelText('Last name');
        const maleRadioInput = await screen.findByLabelText('Male');
        const dateOfBirthInput = await screen.findByLabelText('Date of birth');
        const emailAddressInput = await screen.findByLabelText('Email address');
        const telephoneNumberInput = await screen.findByLabelText('Telephone number');

        const streetInput = await screen.findByLabelText('Street');
        const houseNumberInput = await screen.findByLabelText('House number');
        const postalCodeInput = await screen.findByLabelText('Postal code');
        const cityInput = await screen.findByLabelText('City');

        // Personal details
        await user.type(firstNameInput, 'Jose');
        await user.type(lastNameInput, 'Fernandez');
        await user.click(maleRadioInput);
        await user.type(dateOfBirthInput, '1990-01-01');
        await user.type(emailAddressInput, 'jose@adyen.com');
        await user.type(telephoneNumberInput, '612345678');

        // Billing address
        await user.type(streetInput, 'Simon Carmilgestraat');
        await user.type(houseNumberInput, '100000');
        await user.type(postalCodeInput, '1011DJ');
        await user.type(cityInput, 'Amsterdam');

        const deliveryAddressCheckbox = await screen.findByRole('checkbox', { name: 'Specify a separate delivery address' });
        await user.click(deliveryAddressCheckbox);

        // eslint-disable-next-line testing-library/no-node-access,testing-library/no-container
        const [deliveryAddressSection] = container.querySelectorAll('.adyen-checkout__fieldset--deliveryAddress');

        const deliveryStreetInput = await within(<HTMLElement>deliveryAddressSection).findByLabelText('Street');
        const deliveryHouseNumberInput = await within(<HTMLElement>deliveryAddressSection).findByLabelText('House number');
        const deliveryPostalCodeInput = await within(<HTMLElement>deliveryAddressSection).findByLabelText('Postal code');
        const deliveryCityInput = await within(<HTMLElement>deliveryAddressSection).findByLabelText('City');

        // Delivery address
        await user.type(deliveryStreetInput, 'Kinkerstraat');
        await user.type(deliveryHouseNumberInput, '100');
        await user.type(deliveryPostalCodeInput, '1010PX');
        await user.type(deliveryCityInput, 'Amsterdam');

        const termsAndConditionsCheckbox = await screen.findByRole('checkbox', {
            name: /I agree with the payment conditions of Riverty/i,
            exact: false
        });
        await user.click(termsAndConditionsCheckbox);

        const payButton = await screen.findByRole('button', { name: 'Confirm purchase' });
        await user.click(payButton);

        expect(onSubmitMock).toHaveBeenCalledTimes(1);
        expect(onSubmitMock).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    billingAddress: {
                        city: 'Amsterdam',
                        country: 'NL',
                        houseNumberOrName: '100000',
                        postalCode: '1011DJ',
                        stateOrProvince: 'N/A',
                        street: 'Simon Carmilgestraat'
                    },
                    clientStateDataIndicator: true,
                    dateOfBirth: '1990-01-01',
                    deliveryAddress: {
                        city: 'Amsterdam',
                        country: 'NL',
                        houseNumberOrName: '100',
                        postalCode: '1010PX',
                        stateOrProvince: 'N/A',
                        street: 'Kinkerstraat'
                    },
                    paymentMethod: { checkoutAttemptId: 'fetch-checkoutAttemptId-failed', type: 'afterpay_default' },
                    shopperEmail: 'jose@adyen.com',
                    shopperName: { firstName: 'Jose', gender: 'MALE', lastName: 'Fernandez' },
                    telephoneNumber: '612345678'
                },
                isValid: true
            }),
            expect.anything(),
            expect.anything()
        );
    });

    test('should not submit the payment if form is not valid nor consent checkbox is checked', async () => {
        const user = userEvent.setup();
        const onSubmitMock = jest.fn();

        const afterpay = new AfterPay(global.core, {
            countryCode: 'NL',
            modules: { analytics: global.analytics, resources: global.resources, srPanel: global.srPanel },
            i18n: global.i18n,
            onSubmit: onSubmitMock,
            loadingContext: 'https://checkoutshopper-live.adyen.com/checkoutshopper/'
        });

        const { container } = render(afterpay.render());

        // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
        const [, consentCheckboxContainer] = container.querySelectorAll('.adyen-checkout__field--consentCheckbox');

        const payButton = await screen.findByRole('button', { name: 'Confirm purchase' });
        await user.click(payButton);

        expect(onSubmitMock).toHaveBeenCalledTimes(0);

        expect(screen.getByText('Enter your first name')).toBeInTheDocument();
        expect(screen.getByText('Enter your last name')).toBeInTheDocument();
        expect(screen.getByText('Select your gender')).toBeInTheDocument();
        expect(screen.getByText('Enter the date of birth')).toBeInTheDocument();
        expect(screen.getByText('Enter the email address')).toBeInTheDocument();
        expect(screen.getByText('Enter the telephone number')).toBeInTheDocument();
        expect(screen.getByText('Enter the street')).toBeInTheDocument();
        expect(screen.getByText('Enter the house number')).toBeInTheDocument();
        expect(screen.getByText('Enter the postal code')).toBeInTheDocument();
        expect(screen.getByText('Enter the city')).toBeInTheDocument();
        expect(within(<HTMLElement>consentCheckboxContainer).getByAltText('Error')).toBeInTheDocument();
    });
});
