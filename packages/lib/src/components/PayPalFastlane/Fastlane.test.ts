import { render, screen } from '@testing-library/preact';
import Fastlane from './Fastlane';
import { mock } from 'jest-mock-extended';
import { Resources } from '../../core/Context/Resources';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';

const core = setupCoreMock();

describe('Fastlane', () => {
    test('should always be valid', () => {
        const fastlane = new Fastlane(core);
        expect(fastlane.isValid).toBeTruthy();
    });

    test('should not be available if configuration is missing', async () => {
        let fastlane = new Fastlane(core);
        await expect(fastlane.isAvailable()).rejects.toBeUndefined();

        // @ts-ignore Testing with incomplete config properties
        fastlane = new Fastlane(core, {
            tokenId: 'xxx'
        });
        await expect(fastlane.isAvailable()).rejects.toBeUndefined();

        // @ts-ignore Testing with incomplete config properties
        fastlane = new Fastlane(core, {
            tokenId: 'xxx',
            lastFour: '1111'
        });
        await expect(fastlane.isAvailable()).rejects.toBeUndefined();

        // @ts-ignore Testing with incomplete config properties
        fastlane = new Fastlane(core, {
            tokenId: 'xxx',
            lastFour: '1111',
            brand: 'visa'
        });
        await expect(fastlane.isAvailable()).rejects.toBeUndefined();

        // fastlaneSessionId is mandatory, although it can be that SDK fails to return it. It must not block the payment in this case
        // @ts-ignore Testing with incomplete config properties
        fastlane = new Fastlane(core, {
            tokenId: 'xxx',
            lastFour: '1111',
            brand: 'visa',
            email: 'shopper@adyen.com'
        });
        await expect(fastlane.isAvailable()).resolves.toBeUndefined();

        fastlane = new Fastlane(core, {
            tokenId: 'xxx',
            lastFour: '1111',
            brand: 'visa',
            email: 'shopper@adyen.com',
            fastlaneSessionId: '1111'
        });
        await expect(fastlane.isAvailable()).resolves.toBeUndefined();
    });

    test('should have available card brands visible (Drop-in only)', () => {
        const fastlane = new Fastlane(core);
        expect(fastlane.props.keepBrandsVisible).toBeTruthy();
    });

    test('should return encoded blob to process the payment', () => {
        const fastlane = new Fastlane(core, {
            tokenId: 'token-id',
            lastFour: '1111',
            brand: 'visa',
            email: 'shopper@adyen.com',
            fastlaneSessionId: 'session-id'
        });

        const encodedBlob = btoa(
            JSON.stringify({
                fastlaneSessionId: 'session-id',
                tokenId: 'token-id'
            })
        );

        const state = fastlane.data;

        expect(state.paymentMethod.type).toBe('fastlane');
        expect(state.paymentMethod.fastlaneData).toBe(encodedBlob);
    });

    test('should display last four, card brand and fastlane logo', async () => {
        const resources = mock<Resources>();
        resources.getImage.mockReturnValue((icon: string) => `https://checkout-adyen.com/${icon}`);

        const fastlane = new Fastlane(core, {
            modules: { resources },
            i18n: global.i18n,
            tokenId: 'token-id',
            lastFour: '1111',
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
