import DonationElement from './Donation';
import { render, screen } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import { Resources } from '../../core/Context/Resources';
import Language from '../../language';

describe.each([
    [
        'DonationComponentProps',
        {
            url: 'https://example.org',
            amounts: {
                currency: 'EUR',
                values: [50, 199, 300]
            },
            disclaimerMessage: {
                message: 'By donating you agree to the %{linkText} ',
                linkText: 'terms and conditions',
                link: 'https://www.adyen.com'
            },
            backgroundUrl: 'test',
            description: 'Lorem ipsum...',
            logoUrl: 'test',
            name: 'Test Charity',
            onDonate: jest.fn(),
            onCancel: jest.fn()
        }
    ],
    [
        'NewDonationComponentProps',
        {
            onDonate: jest.fn(),
            onCancel: jest.fn(),
            nonprofitName: 'Test Charity',
            nonprofitUrl: 'https://example.org',
            nonprofitDescription: 'Lorem ipsum...',
            amounts: {
                currency: 'EUR',
                values: [50, 199, 300]
            },
            termsAndConditionsUrl: 'https://www.adyen.com',
            bannerUrl: 'test',
            logoUrl: 'test'
        }
    ]
])('Passing the %p', (_, componentProps) => {
    let donationEle;
    const core = { i18n: new Language(), loadingContext: 'test', modules: { resources: new Resources('test') } };

    beforeEach(() => {
        donationEle = new DonationElement({ ...core, ...componentProps });
    });

    test('should show the banner', async () => {
        render(donationEle.render());
        expect(await screen.findByTestId('background')).toHaveStyle(
            `background-image: linear-gradient(0deg, rgb(0, 0, 0), rgba(0, 0, 0, 0.2)), url("test"})`
        );
    });

    test('should show the logo', async () => {
        render(donationEle.render());
        expect(await screen.findByAltText(/test charity/i)).toHaveAttribute('src', 'test');
    });

    test('should show the non-profit organization url', async () => {
        render(donationEle.render());
        expect((await screen.findAllByRole('link')).some(ele => ele.href.includes('https://example.org'))).toBeTruthy();
    });

    test('should show the non-profit organization description', async () => {
        render(donationEle.render());
        expect(await screen.findByText(/lorem ipsum/i)).toBeInTheDocument();
    });

    test('should show the non-profit organization name', async () => {
        render(donationEle.render());
        expect(await screen.findByText(/test charity/i)).toBeInTheDocument();
    });

    test('should show the terms and condition', async () => {
        render(donationEle.render());
        const tcLink = await screen.findByRole('link', { name: /terms and conditions/ });
        expect(tcLink).toBeInTheDocument();
        expect(tcLink).toHaveAttribute('href', 'https://www.adyen.com');
    });

    test('should call the onDonate callback', async () => {
        render(donationEle.render());
        const donationAmount = await screen.findByRole('radio', { name: /€0.50/i });
        const donateBtn = await screen.findByRole('button', { name: /donate/i });
        await userEvent.click(donationAmount);
        await userEvent.click(donateBtn);
        expect(componentProps.onDonate).toHaveBeenCalledWith({ data: { amount: { value: 50, currency: 'EUR' } }, isValid: true }, expect.any(Object));
    });

    test('should call the onCancel callback', async () => {
        render(donationEle.render());
        const cancelBtn = await screen.findByRole('button', { name: /not now/i });
        await userEvent.click(cancelBtn);
        expect(componentProps.onCancel).toHaveBeenCalledWith({ data: { amount: { value: null, currency: 'EUR' } }, isValid: false });
    });
});
