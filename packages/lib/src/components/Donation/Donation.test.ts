import { render, screen, waitFor } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import DonationElement from './Donation';

const coreProp = { i18n: global.i18n, loadingContext: 'test', modules: { resources: global.resources } };
const shared = {
    commercialTxAmount: 1000,
    termsAndConditionsUrl: 'https://www.adyen.com',
    bannerUrl: '/banner.png',
    logoUrl: '/logo.png',
    nonprofitDescription: 'Lorem ipsum...',
    nonprofitName: 'Test Charity',
    causeName: 'Earthquake Turkey & Syria',
    nonprofitUrl: 'https://example.org'
};
const fixedAmountsDonationProp = {
    ...coreProp,
    ...shared,
    donation: { type: 'fixedAmounts', currency: 'EUR', values: [50, 100] }
};
const roundupDonationProp = {
    ...coreProp,
    ...shared,
    donation: { type: 'roundup', currency: 'EUR', maxRoundupAmount: 100 }
};

describe('Donation element', () => {
    describe('Roundup donation', () => {
        test('should call onDonate with the donation data', async () => {
            const user = userEvent.setup();
            const onDonate = jest.fn();
            // @ts-ignore not all callbacks are needed
            const donationElement = new DonationElement(global.core, {
                ...roundupDonationProp,
                onDonate
            });
            render(donationElement.render());
            const donateBtn = await screen.findByRole('button', { name: 'Donate €1.00' });
            await user.click(donateBtn);
            expect(onDonate).toBeCalledWith({ data: { amount: { currency: 'EUR', value: 100 } }, isValid: true }, expect.any(Object));
        });

        test('should call onCancel with the donation data', async () => {
            const user = userEvent.setup();
            const onCancel = jest.fn();
            // @ts-ignore not all callbacks are needed
            const donationElement = new DonationElement(global.core, {
                ...roundupDonationProp,
                onCancel
            });
            render(donationElement.render());
            const cancelBtn = await screen.findByRole('button', { name: /not now/i });
            await user.click(cancelBtn);
            expect(onCancel).toBeCalledWith({ data: { amount: { currency: 'EUR', value: 100 } }, isValid: true });
        });
    });

    describe('Fixed amounts donation', () => {
        test('should call onDonate with the donation data', async () => {
            const user = userEvent.setup();
            const onDonate = jest.fn();
            const {
                donation: { currency, values: expectedValues }
            } = fixedAmountsDonationProp;
            // @ts-ignore not all callbacks are needed
            const donationElement = new DonationElement(global.core, {
                ...fixedAmountsDonationProp,
                onDonate
            });
            render(donationElement.render());
            const firstAmount = (await screen.findAllByRole('radio'))[0];
            await user.click(firstAmount);
            await waitFor(() => {
                expect(donationElement.isValid).toBe(true);
            });
            const donateBtn = await screen.findByRole('button', { name: 'Donate' });
            await user.click(donateBtn);
            expect(onDonate).toHaveBeenCalledWith({ data: { amount: { currency, value: expectedValues[0] } }, isValid: true }, expect.any(Object));
        });

        test('should call onCancel with the donation data', async () => {
            const user = userEvent.setup();
            const {
                donation: { currency }
            } = fixedAmountsDonationProp;
            const onCancel = jest.fn();
            // @ts-ignore not all callbacks are needed
            const donationElement = new DonationElement(global.core, {
                ...fixedAmountsDonationProp,
                onCancel
            });
            render(donationElement.render());
            const cancelBtn = await screen.findByRole('button', { name: /not now/i });
            await user.click(cancelBtn);
            expect(onCancel).toBeCalledWith({ data: { amount: { currency, value: null } }, isValid: false });
        });
    });
});
