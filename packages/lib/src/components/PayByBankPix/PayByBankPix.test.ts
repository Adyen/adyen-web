import { render, screen } from '@testing-library/preact';
import PayByBankPix from './PayByBankPix';
import { TxVariants } from '../tx-variants';

describe('PayByBankPix', () => {
    test("should render a redirect button on the merchant's page", async () => {
        const payByBankPixElement = new PayByBankPix(global.core, {
            _isAdyenHosted: false,
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources, srPanel: global.srPanel }
        });

        render(payByBankPixElement.render());
        expect(await screen.findByRole('button', { name: /Continue to Pix through OpenBanking/i })).toBeTruthy();
    });

    test("should always be valid on the merchant's page", () => {
        const payByBankPixElement = new PayByBankPix(global.core, {
            _isAdyenHosted: false,
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources, srPanel: global.srPanel }
        });

        expect(payByBankPixElement.isValid).toBe(true);
    });

    test('should render an issuer list on the hosted page', async () => {
        const payByBankPixElement = new PayByBankPix(global.core, {
            _isAdyenHosted: true,
            i18n: global.i18n,
            loadingContext: 'test',
            modules: { resources: global.resources, srPanel: global.srPanel },
            issuers: [{ name: 'Iniciador Mock Bank', id: '123' }]
        });
        render(payByBankPixElement.render());
        expect(await screen.findByRole('listbox')).toBeTruthy();
        expect(await screen.findByRole('option', { name: /Iniciador Mock Bank/i })).toBeTruthy();
    });

    describe('formatData', () => {
        test("should format the correct data on the merchant's page", () => {
            const payByBankPixElement = new PayByBankPix(global.core, {
                _isAdyenHosted: false,
                i18n: global.i18n,
                loadingContext: 'test',
                modules: { resources: global.resources, srPanel: global.srPanel }
            });

            expect(payByBankPixElement.formatData()).toEqual({ paymentMethod: { type: TxVariants.paybybank_pix } });
        });
    });
});
