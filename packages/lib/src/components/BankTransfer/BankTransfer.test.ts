import { render, screen } from '@testing-library/preact';
import BankTransfer from './BankTransfer';

const coreProps = {
    i18n: global.i18n,
    loadingContext: 'test',
    modules: { resources: global.resources, srPanel: global.srPanel, analytics: global.analytics }
};

describe('BankTransfer', () => {
    describe('formatData', () => {
        test('should send the correct data for type bankTransfer_IBAN', () => {
            const bankTransfer = new BankTransfer(global.core, { ...coreProps, type: 'bankTransfer_IBAN' });
            expect(bankTransfer.formatData()).toEqual({
                paymentMethod: {
                    type: 'bankTransfer_IBAN'
                }
            });
        });
        test('should send the correct data for type bankTransfer_NL', () => {
            const bankTransfer = new BankTransfer(global.core, { ...coreProps, type: 'bankTransfer_NL' });
            expect(bankTransfer.formatData()).toEqual({
                paymentMethod: {
                    type: 'bankTransfer_NL',
                    subtype: 'embedded'
                }
            });
        });
    });

    describe('isValid', () => {
        test('should be true if the state is true', () => {
            const bankTransfer = new BankTransfer(global.core, coreProps);
            bankTransfer.state.isValid = true;
            expect(bankTransfer.isValid).toBe(true);
        });

        test('should be false if the state is false', () => {
            const bankTransfer = new BankTransfer(global.core, coreProps);
            bankTransfer.state.isValid = false;
            expect(bankTransfer.isValid).toBe(false);
        });
    });

    describe('render', () => {
        test('should render a redirect button by default', async () => {
            const bankTransfer = new BankTransfer(global.core, { ...coreProps, type: 'bankTransfer_NL', name: 'SEPA Bank Transfer' });
            render(bankTransfer.render());
            expect(await screen.findByRole('button', { name: /Continue to SEPA Bank Transfer/i })).toBeInTheDocument();
        });

        test('should render bank transfer result if there is a reference', async () => {
            const mockResult = {
                totalAmount: {
                    currency: 'EUR',
                    value: 25900
                },
                beneficiary: 'TestMerchantCheckout',
                iban: 'NL95ADYX3000832426',
                bic: 'ADYXNL2A',
                reference: '6B8RP7'
            };

            const bankTransfer = new BankTransfer(global.core, {
                ...coreProps,
                type: 'bankTransfer_NL',
                name: 'SEPA Bank Transfer',
                ...mockResult
            });

            render(bankTransfer.render());
            expect(await screen.findByText('€259.00')).toBeInTheDocument();
            expect(await screen.findByText('Beneficiary name')).toBeInTheDocument();
            expect(await screen.findByText(mockResult.beneficiary)).toBeInTheDocument();
            expect(await screen.findByText('IBAN')).toBeInTheDocument();
            expect(await screen.findByText(mockResult.iban)).toBeInTheDocument();
            expect(await screen.findByText('BIC')).toBeInTheDocument();
            expect(await screen.findByText(mockResult.bic)).toBeInTheDocument();
            expect(await screen.findByText('Reference')).toBeInTheDocument();
            expect(await screen.findByText(mockResult.reference)).toBeInTheDocument();
        });

        test('should render bank transfer result with branchCode when available', async () => {
            const mockResult = {
                totalAmount: {
                    currency: 'AUD',
                    value: 10000
                },
                beneficiary: 'TestMerchantAU',
                accountNumber: '123456789',
                branchCode: '001-001',
                reference: 'AU123REF'
            };

            const bankTransfer = new BankTransfer(global.core, {
                ...coreProps,
                type: 'bankTransfer_AU',
                name: 'Bank Transfer AU',
                ...mockResult
            });

            render(bankTransfer.render());
            expect(await screen.findByText('A$100.00')).toBeInTheDocument();
            expect(await screen.findByText('Beneficiary name')).toBeInTheDocument();
            expect(await screen.findByText(mockResult.beneficiary)).toBeInTheDocument();
            expect(await screen.findByText('Account number')).toBeInTheDocument();
            expect(await screen.findByText(mockResult.accountNumber)).toBeInTheDocument();
            expect(await screen.findByText('Branch code')).toBeInTheDocument();
            expect(await screen.findByText(mockResult.branchCode)).toBeInTheDocument();
            expect(await screen.findByText('Reference')).toBeInTheDocument();
            expect(await screen.findByText(mockResult.reference)).toBeInTheDocument();
        });

        test('should render bank transfer result with bankCode when available', async () => {
            const mockResult = {
                totalAmount: {
                    currency: 'HKD',
                    value: 50000
                },
                beneficiary: 'TestMerchantHK',
                accountNumber: '987654321',
                branchCode: '001234567',
                bankCode: 'HKBANK',
                reference: 'HK456REF'
            };

            const bankTransfer = new BankTransfer(global.core, {
                ...coreProps,
                type: 'bankTransfer_HK',
                name: 'Bank Transfer HK',
                ...mockResult
            });

            render(bankTransfer.render());
            expect(await screen.findByText('HK$500.00')).toBeInTheDocument();
            expect(await screen.findByText('Beneficiary name')).toBeInTheDocument();
            expect(await screen.findByText(mockResult.beneficiary)).toBeInTheDocument();
            expect(await screen.findByText('Account number')).toBeInTheDocument();
            expect(await screen.findByText(mockResult.accountNumber)).toBeInTheDocument();
            expect(await screen.findByText('Branch code')).toBeInTheDocument();
            expect(await screen.findByText(mockResult.branchCode)).toBeInTheDocument();
            expect(await screen.findByText('Bank code')).toBeInTheDocument();
            expect(await screen.findByText(mockResult.bankCode)).toBeInTheDocument();
            expect(await screen.findByText('Reference')).toBeInTheDocument();
            expect(await screen.findByText(mockResult.reference)).toBeInTheDocument();
        });
    });
});
