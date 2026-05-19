import { render, screen } from '@testing-library/preact';
import EMI from './EMI';
import CardElement from '../Card';
import { TxVariants } from '../tx-variants';
import { Resources } from '../../core/Context/Resources';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import PaymentMethods from '../../core/ProcessResponse/PaymentMethods';

const core = setupCoreMock();

const baseProps = {
    i18n: core.modules.i18n,
    loadingContext: 'test',
    modules: { resources: new Resources('test') }
};

const schemePaymentMethod = { type: 'scheme', name: 'Card', brands: ['visa', 'mc'] };

function createCoreWithEmi(hasSupportedScheme: boolean) {
    const paymentMethods = hasSupportedScheme
        ? {
              paymentMethods: [
                  {
                      type: 'emi',
                      name: 'EMI',
                      supportedPaymentMethods: [schemePaymentMethod]
                  },
                  schemePaymentMethod
              ]
          }
        : {
              paymentMethods: [
                  {
                      type: 'emi',
                      name: 'EMI'
                  }
              ]
          };

    return setupCoreMock({ paymentMethods: new PaymentMethods(paymentMethods) });
}

describe('EMI', () => {
    describe('formatData', () => {
        test('should delegate to Card formatData when scheme is supported', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod]
            });

            const data = emi.formatData() as Record<string, Record<string, unknown>>;
            expect(data).toHaveProperty('paymentMethod');
            expect(data.paymentMethod).toHaveProperty('type', TxVariants.scheme);
        });

        test('should return empty object when scheme is not supported', () => {
            const coreWithEmi = createCoreWithEmi(false);
            const emi = new EMI(coreWithEmi, {
                ...baseProps
            });

            expect(emi.formatData()).toEqual({});
        });

        test('should not include emiPlan in formatData', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod]
            });

            const data = emi.formatData() as Record<string, unknown>;
            expect(data).not.toHaveProperty('emiPlan');
        });
    });

    describe('isValid', () => {
        test('should return false when no scheme is supported', () => {
            const coreWithEmi = createCoreWithEmi(false);
            const emi = new EMI(coreWithEmi, {
                ...baseProps
            });

            expect(emi.isValid).toBe(false);
        });

        test('should return false initially when scheme is supported (card not yet filled)', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod]
            });

            expect(emi.isValid).toBe(false);
        });
    });

    describe('showValidation', () => {
        test('should not throw when no scheme is supported', () => {
            const coreWithEmi = createCoreWithEmi(false);
            const emi = new EMI(coreWithEmi, {
                ...baseProps
            });

            expect(() => emi.showValidation()).not.toThrow();
        });

        test('should delegate to card when scheme is supported', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod]
            });

            expect(() => emi.showValidation()).not.toThrow();
        });
    });

    describe('setStatus', () => {
        test('should not throw when no scheme is supported', () => {
            const coreWithEmi = createCoreWithEmi(false);
            const emi = new EMI(coreWithEmi, {
                ...baseProps
            });

            expect(() => emi.setStatus('loading')).not.toThrow();
        });
    });

    describe('unsupported scheme rail', () => {
        test('should not create Card child when supportedPaymentMethods has no scheme', () => {
            const coreWithEmi = createCoreWithEmi(false);
            const emi = new EMI(coreWithEmi, {
                ...baseProps
            });

            expect(emi.card).toBeUndefined();
            expect(emi.isValid).toBe(false);
        });

        test('should render empty body when scheme is not supported', () => {
            const coreWithEmi = createCoreWithEmi(false);
            const emi = new EMI(coreWithEmi, {
                ...baseProps
            });

            const { container } = render(emi.render());
            expect(container.innerHTML).toBe('');
        });

        test('should not initialize card when supportedPaymentMethods contains unsupported rail', () => {
            const coreWithEmi = createCoreWithEmi(false);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [{ type: 'unsupported_rail' }]
            });

            expect(emi.card).toBeUndefined();
            expect(emi.isValid).toBe(false);
        });
    });

    describe('card getter', () => {
        test('should return CardElement when scheme is supported', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod]
            });

            expect(emi.card).toBeDefined();
            expect((emi.card?.constructor as { type?: string })?.type).toBe(TxVariants.scheme);
        });

        test('should return undefined when scheme is not supported', () => {
            const coreWithEmi = createCoreWithEmi(false);
            const emi = new EMI(coreWithEmi, {
                ...baseProps
            });

            expect(emi.card).toBeUndefined();
        });
    });

    describe('prop overrides', () => {
        test('should pass forced overrides to CardElement alongside user config', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const onBinLookupMock = jest.fn();

            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod],
                fundingSourceConfiguration: {
                    card: {
                        hasHolderName: false,
                        onBinLookup: onBinLookupMock
                    }
                }
            });

            const card = emi.card;
            expect(card).toBeDefined();
            expect(card).toBeInstanceOf(CardElement);

            // Forced overrides set by EMI
            expect(card?.props._disableClickToPay).toBe(true);
            expect(card?.props.showPayButton).toBe(false);

            // User-provided config passed through
            expect(card?.props.hasHolderName).toBe(false);
            expect(card?.props.onBinLookup).toBe(onBinLookupMock);
        });
    });

    describe('delegation', () => {
        test('formatData delegates to the active funding source element', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod]
            });

            const card = emi.card;
            expect(card).toBeDefined();

            const cardFormatData = card?.formatData();
            const emiFormatData = emi.formatData();

            expect(emiFormatData).toEqual(cardFormatData);
        });

        test('isValid reflects the underlying CardElement validity', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod]
            });

            expect(emi.isValid).toBe(emi.card?.isValid);
        });
    });

    describe('submit and custom payment button', () => {
        test('submit triggers showValidation when card is invalid', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                showPayButton: false,
                supportedPaymentMethods: [schemePaymentMethod]
            });

            const showValidationSpy = jest.spyOn(emi, 'showValidation');

            emi.submit();

            expect(showValidationSpy).toHaveBeenCalled();
            showValidationSpy.mockRestore();
        });

        test('native pay button is not rendered when showPayButton is false', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                showPayButton: false,
                supportedPaymentMethods: [schemePaymentMethod]
            });

            render(emi.render());
            expect(screen.queryByRole('button', { name: /pay/i })).toBeNull();
        });
    });

    describe('UI Rendering', () => {
        test('should render card form when scheme is supported', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod]
            });

            const { container } = render(emi.render());
            expect(container.innerHTML).not.toBe('');
        });

        test('should render nothing when scheme is not supported', () => {
            const coreWithEmi = createCoreWithEmi(false);
            const emi = new EMI(coreWithEmi, {
                ...baseProps
            });

            const { container } = render(emi.render());
            expect(container.innerHTML).toBe('');
        });

        test('should expose subtitle via additionalInfo for Drop-in', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod]
            });

            expect(emi.additionalInfo).toMatch(/offers available for credit cards/i);
        });

        test('should not render Phase 2 UI elements', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod]
            });

            render(emi.render());

            expect(screen.queryByText(/^provider$/i)).toBeNull();
            expect(screen.queryByText(/^plans$/i)).toBeNull();
            expect(screen.queryByText(/^offers$/i)).toBeNull();
            expect(screen.queryByText(/^summary$/i)).toBeNull();
            expect(screen.queryByText(/no cost/i)).toBeNull();
            expect(screen.queryByText(/low cost/i)).toBeNull();
        });
    });
});
