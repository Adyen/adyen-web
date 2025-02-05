import { render, screen } from '@testing-library/preact';
import Fastlane from './Fastlane';
import { mock } from 'jest-mock-extended';
import { Resources } from '../../core/Context/Resources';

describe('Fastlane', () => {
    test('should always be valid', () => {
        const fastlane = new Fastlane(global.core);
        expect(fastlane.isValid).toBeTruthy();
    });

    test('should not be available if configuration is missing', async () => {
        let fastlane = new Fastlane(global.core);
        await expect(fastlane.isAvailable()).rejects.toBeUndefined();

        // @ts-ignore Testing with incomplete config properties
        fastlane = new Fastlane(global.core, {
            tokenId: 'xxx'
        });
        await expect(fastlane.isAvailable()).rejects.toBeUndefined();

        // @ts-ignore Testing with incomplete config properties
        fastlane = new Fastlane(global.core, {
            tokenId: 'xxx',
            lastFour: '1111',
            customerId: 'customer-id'
        });
        await expect(fastlane.isAvailable()).rejects.toBeUndefined();

        // @ts-ignore Testing with incomplete config properties
        fastlane = new Fastlane(global.core, {
            tokenId: 'xxx',
            lastFour: '1111',
            customerId: 'customer-id',
            brand: 'visa'
        });
        await expect(fastlane.isAvailable()).rejects.toBeUndefined();

        // @ts-ignore Testing with incomplete config properties
        fastlane = new Fastlane(global.core, {
            tokenId: 'xxx',
            lastFour: '1111',
            customerId: 'customer-id',
            brand: 'visa',
            email: 'shopper@adyen.com'
        });
        await expect(fastlane.isAvailable()).rejects.toBeUndefined();

        fastlane = new Fastlane(global.core, {
            tokenId: 'xxx',
            lastFour: '1111',
            customerId: 'customer-id',
            brand: 'visa',
            email: 'shopper@adyen.com',
            fastlaneSessionId: '1111'
        });
        await expect(fastlane.isAvailable()).resolves.toBeUndefined();
    });

    test('should have available card brands visible (Drop-in only)', () => {
        const fastlane = new Fastlane(global.core);
        expect(fastlane.props.keepBrandsVisible).toBeTruthy();
    });

    test('should return encoded blob to process the payment', () => {
        const fastlane = new Fastlane(global.core, {
            tokenId: 'token-id',
            lastFour: '1111',
            brand: 'visa',
            customerId: 'customer-id',
            email: 'shopper@adyen.com',
            fastlaneSessionId: 'session-id'
        });

        const encodedBlob = btoa(
            JSON.stringify({
                fastlaneSessionId: 'session-id',
                tokenId: 'token-id',
                customerId: 'customer-id'
            })
        );

        const state = fastlane.data;

        expect(state.paymentMethod.type).toBe('fastlane');
        expect(state.paymentMethod.fastlaneData).toBe(encodedBlob);
    });

    test('should display last four, card brand and fastlane logo', async () => {
        const resources = mock<Resources>();
        resources.getImage.mockReturnValue((icon: string) => `https://checkout-adyen.com/${icon}`);

        const fastlane = new Fastlane(global.core, {
            modules: { resources },
            i18n: global.i18n,
            tokenId: 'token-id',
            lastFour: '1111',
            customerId: 'customer-id',
            brand: 'visa',
            email: 'shopper@adyen.com',
            fastlaneSessionId: 'session-id'
        });

        render(fastlane.render());

        const fastlaneImage = await screen.findByAltText('Fastlane logo');
        const cardBrandImage = await screen.findByAltText('VISA');

        expect(fastlaneImage).toHaveAttribute('src', 'https://checkout-adyen.com/paypal_fastlane_gray');
        expect(cardBrandImage).toHaveAttribute('src', 'https://checkout-adyen.com/visa');
        expect(screen.queryByText('•••• 1111')).toBeVisible();
    });
});
