import { h } from 'preact';
import Riverty from './Riverty';
import { render, screen } from '@testing-library/preact';
import { Resources } from '../../core/Context/Resources';
import { SRPanel } from '../../core/Errors/SRPanel';
import Language from '../../language';
import getDataset from '../../core/Services/get-dataset';
import { termsAndConditionsUrlMap } from './config';

jest.mock('../../core/Services/get-dataset');
const countriesMock = [
    {
        id: 'DE',
        name: 'Germany'
    }
];

(getDataset as jest.Mock).mockImplementation(jest.fn(() => Promise.resolve(countriesMock)));

describe('Riverty', () => {
    const props = {
        i18n: new Language(),
        loadingContext: 'test',
        countryCode: 'DE',
        modules: {
            resources: new Resources('test'),
            srPanel: new SRPanel({})
        }
    };

    describe('personal details', () => {
        test('should show required fields', async () => {
            // @ts-ignore ignore
            render(<Riverty {...props} />);
            const firstName = await screen.findByLabelText('First name', { selector: 'input' });
            const lastName = await screen.findByLabelText('Last name', { selector: 'input' });
            const dateOfBirth = await screen.findByLabelText('Date of birth', { selector: 'input' });
            const email = await screen.findByLabelText('Email address', { selector: 'input' });
            const telephone = await screen.findByLabelText('Telephone number', { selector: 'input' });
            const male = screen.queryByLabelText('Male');
            const female = screen.queryByLabelText('Female');

            expect(firstName).not.toBeNull();
            expect(lastName).not.toBeNull();
            expect(dateOfBirth).not.toBeNull();
            expect(email).not.toBeNull();
            expect(telephone).not.toBeNull();
            expect(male).toBeNull();
            expect(female).toBeNull();
        });
    });

    describe('delivery address', () => {
        test('should show required fields', async () => {
            const withDeliveryAddressData = {
                ...props,
                data: {
                    deliveryAddress: {
                        firstName: 'First',
                        lastName: 'Last'
                    }
                }
            };
            // @ts-ignore ignore
            render(<Riverty {...withDeliveryAddressData} />);
            const firstName = await screen.findByLabelText('Recipient first name', { selector: 'input' });
            const lastName = await screen.findByLabelText('Recipient last name', { selector: 'input' });
            const country = await screen.findAllByLabelText('Country');
            const street = await screen.findAllByLabelText('Street');
            const houseNumber = await screen.findAllByLabelText('House number');
            const postalCode = await screen.findAllByLabelText('Postal code');
            const city = await screen.findAllByLabelText('City');
            expect(firstName).not.toBeNull();
            expect(lastName).not.toBeNull();
            expect(country.length).toBe(2);
            expect(street.length).toBe(2);
            expect(houseNumber.length).toBe(2);
            expect(postalCode.length).toBe(2);
            expect(city.length).toBe(2);
        });
    });

    describe('delivery address', () => {
        test('should show required fields', async () => {
            render(new Riverty(props).render());
            const tcLink = await screen.findByRole('link', { name: 'payment conditions' });
            expect(tcLink).toHaveAttribute('href', termsAndConditionsUrlMap[props.countryCode.toLowerCase()].en);
        });
    });
});
