import { ComponentChild, createRef, h } from 'preact';
import { render, screen, act, fireEvent } from '@testing-library/preact';
import CardInput from './CardInput';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { AmountProvider } from '../../../../core/Context/AmountProvider';
import { CardInputRef } from './types';
import { BinLookupResponse, BrandObject } from '../../types';

jest.mock('../../../internal/SecuredFields/lib/CSF');

// Required<> because the ref's members are all optional on the interface, but always present once CardInput has assigned it.
// processBinLookupResponse is redeclared because triggerBinLookUp passes null on reset, which the interface's signature does not admit.
type AssignedCardInputRef = Required<Omit<CardInputRef, 'processBinLookupResponse'>> & {
    processBinLookupResponse: (binLookupResponse: BinLookupResponse | null, isReset: boolean) => void;
};

let cardInputRef: AssignedCardInputRef;

const cardInputRequiredProps = {
    i18n: global.i18n,
    clientKey: 'xxxx',
    loadingContext: 'test',
    resources: global.resources,
    brandsIcons: [],
    brandsConfiguration: {},
    showPayButton: false,
    onSubmitAnalytics: jest.fn(),
    setComponentRef: jest.fn(ref => {
        cardInputRef = ref;
    })
};

const selectableDualBrandResp: BinLookupResponse = {
    issuingCountryCode: 'FR',
    supportedBrands: [
        {
            brand: 'visa',
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            expiryDatePolicy: 'required',
            localeBrand: 'VISA',
            paymentMethodVariant: 'visa',
            showSocialSecurityNumber: false,
            supported: true
        },
        {
            brand: 'cartebancaire',
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            expiryDatePolicy: 'required',
            localeBrand: 'Carte Bancaire',
            paymentMethodVariant: 'cartebancaire',
            showSocialSecurityNumber: false,
            supported: true
        }
    ]
};

const displayOnlyDualBrandResp: BinLookupResponse = {
    issuingCountryCode: 'AU',
    supportedBrands: [
        {
            brand: 'visa',
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            expiryDatePolicy: 'required',
            localeBrand: 'VISA',
            paymentMethodVariant: 'visa',
            showSocialSecurityNumber: false,
            supported: true
        },
        {
            brand: 'eftpos_australia',
            cvcPolicy: 'required',
            enableLuhnCheck: true,
            expiryDatePolicy: 'required',
            localeBrand: 'eftpos Australia',
            paymentMethodVariant: 'eftpos_australia',
            showSocialSecurityNumber: false,
            supported: true
        }
    ]
};

const fundingSourceBrands: BrandObject[] = [
    {
        brand: 'cartebancaire',
        cvcPolicy: 'required',
        enableLuhnCheck: true,
        expiryDatePolicy: 'required',
        localeBrand: 'Carte Bancaire',
        paymentMethodVariant: 'cartebancaire',
        showSocialSecurityNumber: false,
        supported: true,
        fundingSource: 'debit'
    },
    {
        brand: 'visa',
        cvcPolicy: 'required',
        enableLuhnCheck: true,
        expiryDatePolicy: 'required',
        localeBrand: 'VISA',
        paymentMethodVariant: 'visa',
        showSocialSecurityNumber: false,
        supported: true,
        fundingSource: 'credit'
    }
];

const fundingSourceDualBrandResp: BinLookupResponse = { issuingCountryCode: 'FR', supportedBrands: fundingSourceBrands };

const renderCardInput = (ui: ComponentChild) => {
    return render(
        <CoreProvider i18n={global.i18n} loadingContext="test" resources={global.resources}>
            <AmountProvider amount={{ value: 10, currency: 'EUR' }} providerRef={createRef()}>
                {ui}
            </AmountProvider>
        </CoreProvider>
    );
};

describe('CardNumber and the dual branding UI', () => {
    test('should render without brand selection UI or contextual label when no dual branding', () => {
        const { container } = renderCardInput(<CardInput {...cardInputRequiredProps} />);

        /* eslint-disable testing-library/no-node-access, testing-library/no-container */
        expect(container.querySelector('[data-cse="encryptedCardNumber"]')).toBeTruthy();
        expect(container.querySelector('[data-cse="encryptedExpiryDate"]')).toBeTruthy();
        expect(container.querySelector('[data-cse="encryptedSecurityCode"]')).toBeTruthy();
        /* eslint-enable testing-library/no-node-access, testing-library/no-container */

        expect(screen.queryAllByRole('button')).toHaveLength(0);
        expect(screen.queryByRole('group')).not.toBeInTheDocument();
    });

    test('should show two selectable brand options with first selected by default and contextual label for selectable dual brand', async () => {
        renderCardInput(<CardInput {...cardInputRequiredProps} />);

        await act(() => {
            cardInputRef.processBinLookupResponse(selectableDualBrandResp, false);
        });

        // Two brand options with accessible names
        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(2);
        expect(screen.getByRole('button', { name: /visa/i })).toBeVisible();
        expect(screen.getByRole('button', { name: /cartebancaire/i })).toBeVisible();

        // First brand is selected by default
        expect(buttons[0]).toHaveAttribute('aria-pressed', 'true');

        // Contextual label visible (use getAllByText since text appears in both aria-live region and contextual span)
        const contextualTexts = screen.getAllByText(/the card brand/i);
        expect(contextualTexts.length).toBeGreaterThanOrEqual(1);
        expect(contextualTexts[0]).toBeVisible();
    });

    test('should show display-only icons without selection UI or contextual label for non-selectable dual brand', async () => {
        renderCardInput(<CardInput {...cardInputRequiredProps} />);

        await act(() => {
            cardInputRef.processBinLookupResponse(displayOnlyDualBrandResp, false);
        });

        // Two brand images visible (display-only)
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(2);

        // No interactive selection UI
        expect(screen.queryAllByRole('button')).toHaveLength(0);
        expect(screen.queryByRole('group')).not.toBeInTheDocument();

        // No contextual label
        expect(screen.queryByText(/the card brand/i)).not.toBeInTheDocument();
    });

    test('should not trigger validation when selecting a brand while PAN field is still active', async () => {
        renderCardInput(<CardInput {...cardInputRequiredProps} />);

        await act(() => {
            cardInputRef.processBinLookupResponse(selectableDualBrandResp, false);
        });

        // Brand selection and contextual text are visible
        expect(screen.getAllByRole('button')).toHaveLength(2);
        expect(screen.getAllByText(/the card brand/i).length).toBeGreaterThanOrEqual(1);

        // First brand (visa) is selected by default
        const visaButton = screen.getByRole('button', { name: /visa/i });
        const cbButton = screen.getByRole('button', { name: /cartebancaire/i });
        expect(visaButton).toHaveAttribute('aria-pressed', 'true');
        expect(cbButton).toHaveAttribute('aria-pressed', 'false');

        // Click the second brand while PAN is incomplete (no blur has occurred)
        fireEvent.click(cbButton);

        // Brand selection UI must remain visible — no validation error triggered
        expect(screen.getAllByRole('button')).toHaveLength(2);

        // The chosen brand should now be selected
        expect(screen.getByRole('button', { name: /cartebancaire/i })).toHaveAttribute('aria-pressed', 'true');

        // Contextual text must remain visible
        expect(screen.getAllByText(/the card brand/i).length).toBeGreaterThanOrEqual(1);

        // Switch back to first brand — still no validation
        fireEvent.click(screen.getByRole('button', { name: /visa/i }));

        expect(screen.getAllByRole('button')).toHaveLength(2);
        expect(screen.getByRole('button', { name: /visa/i })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getAllByText(/the card brand/i).length).toBeGreaterThanOrEqual(1);
    });

    test('should hide brand selection UI and contextual label when PAN has validation error', async () => {
        renderCardInput(<CardInput {...cardInputRequiredProps} />);

        await act(() => {
            cardInputRef.processBinLookupResponse(selectableDualBrandResp, false);
        });

        // Brand selection is visible before error
        expect(screen.getAllByRole('button')).toHaveLength(2);

        await act(() => {
            cardInputRef.showValidation();
        });

        // Error state shown — at least one error element is visible
        expect(screen.queryAllByRole('button')).toHaveLength(0);
        expect(screen.queryAllByText(/the card brand/i)[0]).toHaveClass('adyen-checkout__card__dual-branding__sr-only');
    });

    describe('Funding source validation', () => {
        const renderWithAllowedDebit = () => renderCardInput(<CardInput {...cardInputRequiredProps} allowedFundingSources={['debit']} />);

        test('should preselect brand with an allowed funding source as the leading brand', async () => {
            renderWithAllowedDebit();

            await act(() => {
                cardInputRef.processBinLookupResponse(fundingSourceDualBrandResp, false);
            });

            expect(screen.getByRole('button', { name: /cartebancaire/i })).toHaveAttribute('aria-pressed', 'true');
            expect(screen.getByRole('button', { name: /visa/i })).toHaveAttribute('aria-pressed', 'false');
            expect(screen.queryByText(/not supported/i)).not.toBeInTheDocument();
        });

        test('should show the unsupported funding source error while keeping the selector visible on disallowed brand selection', async () => {
            renderWithAllowedDebit();

            await act(() => {
                cardInputRef.processBinLookupResponse(fundingSourceDualBrandResp, false);
            });

            fireEvent.click(screen.getByRole('button', { name: /visa/i }));

            expect(screen.getAllByText(/not supported/i).length).toBeGreaterThanOrEqual(1);

            // The shopper is not stranded: both options remain on screen and the picked one is selected
            expect(screen.getAllByRole('button')).toHaveLength(2);
            expect(screen.getByRole('button', { name: /visa/i })).toHaveAttribute('aria-pressed', 'true');
        });

        test('should clear the error when the shopper switches back to the allowed brand', async () => {
            renderWithAllowedDebit();

            await act(() => {
                cardInputRef.processBinLookupResponse(fundingSourceDualBrandResp, false);
            });

            fireEvent.click(screen.getByRole('button', { name: /visa/i }));
            expect(screen.getAllByText(/not supported/i).length).toBeGreaterThanOrEqual(1);

            fireEvent.click(screen.getByRole('button', { name: /cartebancaire/i }));

            expect(screen.queryByText(/not supported/i)).not.toBeInTheDocument();
            expect(screen.getByRole('button', { name: /cartebancaire/i })).toHaveAttribute('aria-pressed', 'true');
        });

        test('should show the error with no brand selector when neither brand has an allowed funding source', async () => {
            renderCardInput(<CardInput {...cardInputRequiredProps} allowedFundingSources={['debit']} />);

            await act(() => {
                cardInputRef.processBinLookupResponse(
                    {
                        issuingCountryCode: 'FR',
                        supportedBrands: fundingSourceBrands.map(brand => ({ ...brand, fundingSource: 'credit' as const }))
                    },
                    false
                );
            });

            expect(screen.getAllByText(/not supported/i).length).toBeGreaterThanOrEqual(1);
            // Nothing to choose between, so unlike the picked-the-wrong-brand case no selector is offered
            expect(screen.queryAllByRole('button')).toHaveLength(0);
        });

        test('should not leave the previous selector on screen when the next card is rejected', async () => {
            renderWithAllowedDebit();

            await act(() => {
                cardInputRef.processBinLookupResponse(fundingSourceDualBrandResp, false);
            });
            expect(screen.getAllByRole('button')).toHaveLength(2);

            // The shopper edits a digit in place, so the PAN never drops below the threshold and no reset happens
            await act(() => {
                cardInputRef.processBinLookupResponse(
                    {
                        issuingCountryCode: 'FR',
                        supportedBrands: fundingSourceBrands.map(brand => ({ ...brand, fundingSource: 'credit' as const }))
                    },
                    false
                );
            });

            expect(screen.getAllByText(/not supported/i).length).toBeGreaterThanOrEqual(1);
            expect(screen.queryAllByRole('button')).toHaveLength(0);
        });

        test('should clear the error when the PAN drops below the binLookup threshold', async () => {
            renderWithAllowedDebit();

            await act(() => {
                cardInputRef.processBinLookupResponse(fundingSourceDualBrandResp, false);
            });
            fireEvent.click(screen.getByRole('button', { name: /visa/i }));
            expect(screen.getAllByText(/not supported/i).length).toBeGreaterThanOrEqual(1);

            await act(() => {
                cardInputRef.processBinLookupResponse(null, true);
            });

            expect(screen.queryByText(/not supported/i)).not.toBeInTheDocument();
            expect(screen.queryAllByRole('button')).toHaveLength(0);
        });

        test('should not flag any brand when no funding sources are configured', async () => {
            renderCardInput(<CardInput {...cardInputRequiredProps} />);

            await act(() => {
                cardInputRef.processBinLookupResponse(fundingSourceDualBrandResp, false);
            });

            fireEvent.click(screen.getByRole('button', { name: /visa/i }));

            expect(screen.queryByText(/not supported/i)).not.toBeInTheDocument();
        });
    });

    describe('Accessibility - Live Region', () => {
        test('should have aria-live region with contextual text when dual branding appears', async () => {
            const { container } = renderCardInput(<CardInput {...cardInputRequiredProps} />);

            // Live region exists but is empty initially
            /* eslint-disable testing-library/no-node-access, testing-library/no-container */
            const liveRegion = container.querySelector('[aria-live="polite"]');
            /* eslint-enable testing-library/no-node-access, testing-library/no-container */
            expect(liveRegion).toBeInTheDocument();
            expect(liveRegion).toHaveTextContent('');

            await act(() => {
                cardInputRef.processBinLookupResponse(selectableDualBrandResp, false);
            });

            // After dual branding appears, live region has contextual text
            expect(liveRegion).toHaveTextContent(/the card brand/i);
        });

        test('should have empty aria-live region when no dual branding', () => {
            const { container } = renderCardInput(<CardInput {...cardInputRequiredProps} />);

            // Live region always exists but is empty when no dual branding
            /* eslint-disable testing-library/no-node-access, testing-library/no-container */
            const liveRegion = container.querySelector('[aria-live="polite"]');
            /* eslint-enable testing-library/no-node-access, testing-library/no-container */
            expect(liveRegion).toBeInTheDocument();
            expect(liveRegion).toHaveTextContent('');
        });

        test('should have empty aria-live region for display-only dual branding', async () => {
            const { container } = renderCardInput(<CardInput {...cardInputRequiredProps} />);

            await act(() => {
                cardInputRef.processBinLookupResponse(displayOnlyDualBrandResp, false);
            });

            // Display-only dual branding should have empty live region (no contextual text needed)
            /* eslint-disable testing-library/no-node-access, testing-library/no-container */
            const liveRegion = container.querySelector('[aria-live="polite"]');
            /* eslint-enable testing-library/no-node-access, testing-library/no-container */
            expect(liveRegion).toBeInTheDocument();
            expect(liveRegion).toHaveTextContent('');
        });
    });
});
