import { render, screen, within } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import EMI from './EMI';
import CardElement from '../Card';
import { TxVariants } from '../tx-variants';
import { Resources } from '../../core/Context/Resources';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import PaymentMethods from '../../core/ProcessResponse/PaymentMethods';
import { AdyenCheckout, ThreeDS2Challenge, ThreeDS2DeviceFingerprint } from '../../index';
import { InfoEventType, UiTarget } from '../../core/Analytics/events/AnalyticsInfoEvent';
import { ErrorEventCode, ErrorEventType } from '../../core/Analytics/events/AnalyticsErrorEvent';
import { emiDebitIssuerMock, emiPlansDebitOnlyResponseMock, emiPlansEmptyResponseMock, emiPlansResponseMock } from './stories/mocks';
import type { PaymentActionsType, PaymentData, RawPaymentMethod } from '../../types/global-types';
import type { EMIConfiguration, EmiPlanPayload, SupportedPaymentMethod } from './types';

const core = setupCoreMock();

/** EMI only offers itself once it has plans, so every construction here starts from a valid response. */
const baseProps = {
    i18n: core.modules.i18n,
    loadingContext: 'test',
    modules: { resources: new Resources('test') },
    plans: emiPlansResponseMock
};

const [hdfc] = emiPlansResponseMock.issuers;

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

/** The several `scheme` entries a `splitCardFundingSources` merchant receives, each with its own funding source and brands. */
const splitFundingSourceSchemes: RawPaymentMethod[] = [
    { type: 'scheme', name: 'Debit Card', fundingSource: 'debit', brands: ['maestro'] },
    { type: 'scheme', name: 'Credit Card', fundingSource: 'credit', brands: ['visa', 'mc', 'amex'] }
];

function createCoreWithSplitSchemes(supportedPaymentMethods: SupportedPaymentMethod[]) {
    const paymentMethods = {
        // `supportedPaymentMethods` is EMI's own field on the response entry, which `RawPaymentMethod` does not declare
        paymentMethods: [{ type: 'emi', name: 'EMI', supportedPaymentMethods } as RawPaymentMethod, ...splitFundingSourceSchemes]
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

        /** The plan is preselected by the first render, so an unrendered component has no selection yet. */
        test('should not include emiPlan while no plan has been selected', () => {
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

        /** UPI is the rail the response gains next, and a version that renders none of it must drop the tile whole. */
        test('should offer nothing at all when every rail of the response is one it does not render', async () => {
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
            const emi = new EMI(createCoreWithEmi(false), {
                ...baseProps,
                supportedPaymentMethods: [{ type: 'upi', name: 'UPI' }, { type: 'unsupported_rail' }]
            });

            const { container } = render(emi.render());

            expect(emi.card).toBeUndefined();
            expect(container.innerHTML).toBe('');
            await expect(emi.isAvailable()).rejects.toThrow('EMI: No valid supported payment methods available');
            warn.mockRestore();
        });
    });

    describe('mixed supported payment methods', () => {
        const upiPaymentMethod = { type: 'upi', name: 'UPI' };

        test('should create Card when supportedPaymentMethods contains both scheme and upi', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod, upiPaymentMethod]
            });

            expect(emi.card).toBeDefined();
            expect(emi.card).toBeInstanceOf(CardElement);
        });

        test('should resolve isAvailable when at least one payment method is supported', async () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod, upiPaymentMethod]
            });

            await expect(emi.isAvailable()).resolves.toBeUndefined();
        });

        test('should render card form with mixed supported payment methods', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod, upiPaymentMethod]
            });

            const { container } = render(emi.render());
            expect(container.innerHTML).not.toBe('');
        });

        test('should initialize Card even when scheme is not the first entry', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [upiPaymentMethod, schemePaymentMethod]
            });

            expect(emi.card).toBeDefined();
            expect(emi.card).toBeInstanceOf(CardElement);

            const { container } = render(emi.render());
            expect(container.innerHTML).not.toBe('');
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
                supportedPaymentMethodsConfiguration: {
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

    describe('brands', () => {
        test('should take the brands of the matched entry, not those of the first scheme in the response', () => {
            const supportedPaymentMethods = [{ type: 'scheme', name: 'Cards', brands: ['mc', 'rupay', 'visa'] }];
            const emi = new EMI(createCoreWithSplitSchemes(supportedPaymentMethods), { ...baseProps, supportedPaymentMethods });

            expect(emi.card?.props.brands).toEqual(['mc', 'rupay', 'visa']);
        });

        test('should fall back to the brands resolved from the response when the matched entry carries none', () => {
            const supportedPaymentMethods = [{ type: 'scheme', name: 'Cards' }];
            const emi = new EMI(createCoreWithSplitSchemes(supportedPaymentMethods), { ...baseProps, supportedPaymentMethods });

            expect(emi.card?.props.brands).toEqual(['maestro']);
        });

        test('should let the card configuration override the brands of the matched entry', () => {
            const supportedPaymentMethods = [{ type: 'scheme', name: 'Cards', brands: ['mc', 'rupay', 'visa'] }];
            const emi = new EMI(createCoreWithSplitSchemes(supportedPaymentMethods), {
                ...baseProps,
                supportedPaymentMethods,
                supportedPaymentMethodsConfiguration: { card: { brands: ['rupay'] } }
            });

            expect(emi.card?.props.brands).toEqual(['rupay']);
        });
    });

    /**
     * The child Card is created without a `type` or a `paymentMethodId`, so it resolves its entry of the response
     * positionally, and would otherwise inherit the funding source of whichever `scheme` the backend listed first.
     * EMI charges credit plans only, and `emiPlan.fundingSource` already carries that for the selected plan.
     */
    describe('child card funding source', () => {
        test('should send no funding source, whichever scheme the response lists first', () => {
            const supportedPaymentMethods = [{ type: 'scheme', name: 'Cards', brands: ['mc', 'rupay', 'visa'] }];
            const emi = new EMI(createCoreWithSplitSchemes(supportedPaymentMethods), { ...baseProps, supportedPaymentMethods });

            const data = emi.formatData() as Record<string, Record<string, unknown>>;

            expect(emi.card?.props.fundingSource).toBeUndefined();
            expect(data.paymentMethod).not.toHaveProperty('fundingSource');
        });

        test('should send no funding source even when one is configured on the card', () => {
            const supportedPaymentMethods = [{ type: 'scheme', name: 'Cards' }];
            const emi = new EMI(createCoreWithSplitSchemes(supportedPaymentMethods), {
                ...baseProps,
                supportedPaymentMethods,
                // `EMIConfiguration` excludes it, but a JavaScript integration can still pass it
                supportedPaymentMethodsConfiguration: { card: { fundingSource: 'debit' } as never }
            });

            const data = emi.formatData() as Record<string, Record<string, unknown>>;

            expect(emi.card?.props.fundingSource).toBeUndefined();
            expect(data.paymentMethod).not.toHaveProperty('fundingSource');
        });

        test('should keep the config it resolved from the response, which a funding source lookup would lose', () => {
            const supportedPaymentMethods = [{ type: 'scheme', name: 'Cards' }];
            const emi = new EMI(createCoreWithSplitSchemes(supportedPaymentMethods), { ...baseProps, supportedPaymentMethods });

            expect(emi.card?.props.brands).toEqual(['maestro']);
        });
    });

    describe('delegation', () => {
        test('formatData delegates to the active supported payment method element', () => {
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

        /**
         * The plan summary already itemises the transaction amount, the discount and the interest,
         * so repeating the amount on the button only invites the shopper to compare figures.
         */
        test('native pay button omits the amount', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                amount: { value: 100000, currency: 'INR' },
                supportedPaymentMethods: [schemePaymentMethod]
            });

            render(emi.render());

            expect(screen.getByRole('button', { name: 'Pay' })).toBeInTheDocument();
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

    describe('onChange', () => {
        test('should call onChange prop on EMI when Card child state changes', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const onChangeMock = jest.fn();

            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod],
                onChange: onChangeMock
            });

            expect(emi.card).toBeDefined();

            emi.card?.setState({ data: { cardNumber: '4111111111111111' } });

            expect(onChangeMock).toHaveBeenCalled();
        });

        test('should not throw when onChange is not provided', () => {
            const coreWithEmi = createCoreWithEmi(true);

            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod]
            });

            expect(() => emi.card?.setState({ data: {} })).not.toThrow();
        });
    });

    describe('isAvailable', () => {
        test('should resolve when valid supported payment methods exist', async () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod]
            });

            await expect(emi.isAvailable()).resolves.toBeUndefined();
        });

        test('should reject when no supportedPaymentMethods are provided', async () => {
            const coreWithEmi = createCoreWithEmi(false);
            const emi = new EMI(coreWithEmi, {
                ...baseProps
            });

            await expect(emi.isAvailable()).rejects.toThrow('EMI: No valid supported payment methods available');
        });

        test('should reject when supportedPaymentMethods contains unsupported rail', async () => {
            const coreWithEmi = createCoreWithEmi(false);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [{ type: 'unsupported_rail' }]
            });

            await expect(emi.isAvailable()).rejects.toThrow('EMI: No valid supported payment methods available');
        });
    });

    describe('handleAction (3DS)', () => {
        test('should handle fingerprint action via elementRef propagation', async () => {
            const fingerprintAction = {
                paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                authorisationToken: 'BQABAQCmFNEdaCE3rcbbB...',
                paymentMethodType: 'scheme',
                subtype: 'fingerprint',
                token: 'eyJ0aHJlZURTTWV0aG9kTm90a...',
                type: 'threeDS2' as PaymentActionsType
            };

            const checkout = await AdyenCheckout({
                countryCode: 'IN',
                environment: 'test',
                clientKey: 'test_123456'
            });

            const emi = new EMI(checkout, {
                supportedPaymentMethods: [schemePaymentMethod]
            }).mount('body');

            const actionComponent = emi.handleAction(fingerprintAction);
            expect(actionComponent instanceof ThreeDS2DeviceFingerprint).toBe(true);
        });

        test('should handle challenge action via elementRef propagation', async () => {
            const challengeAction = {
                paymentData: 'Ab02b4c0!BQABAgCUeRP+3La4...',
                authorisationToken: 'BQABAQCmFNEdaCE3rcbbB...',
                subtype: 'challenge',
                token: 'xxx',
                paymentMethodType: 'scheme',
                type: 'threeDS2' as PaymentActionsType
            };

            const checkout = await AdyenCheckout({
                countryCode: 'IN',
                environment: 'test',
                clientKey: 'test_123456',
                analytics: { enabled: false },
                srConfig: { enabled: false }
            });

            const emi = new EMI(checkout, {
                supportedPaymentMethods: [schemePaymentMethod]
            }).mount('body');

            const actionComponent = emi.handleAction(challengeAction);
            expect(actionComponent instanceof ThreeDS2Challenge).toBe(true);
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

            expect(emi.additionalInfo).toMatch(/installment plans on credit cards/i);
        });
    });

    describe('plan selection', () => {
        test('should preselect the first issuer and its first plan from the plans prop', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod]
            });

            render(emi.render());

            expect(screen.getByLabelText('Provider')).toHaveTextContent(hdfc.issuerName);
            expect(screen.getByLabelText('Plan')).toHaveTextContent('₹51,666.33 x 3 months');
            expect(screen.getByRole('form')).toBeInTheDocument();
        });

        test('should offer every issuer the response carries', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod]
            });

            render(emi.render());

            const providerOptions = within(screen.getAllByRole('listbox')[0]).getAllByRole('option');

            expect(providerOptions).toHaveLength(emiPlansResponseMock.issuers.length);
        });

        test('should not issue a network request while rendering', () => {
            const fetchSpy = jest.spyOn(globalThis, 'fetch');
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod]
            });

            render(emi.render());

            expect(fetchSpy).not.toHaveBeenCalled();
            fetchSpy.mockRestore();
        });

        test('should include the emiPlan of the preselected plan in formatData', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod]
            });

            render(emi.render());

            expect(emi.formatData()).toHaveProperty('emiPlan', {
                tenureMonths: 3,
                issuerName: 'HDFC',
                fundingSource: 'credit',
                planType: 'NO_COST',
                interestRateBps: 1550,
                appliedOfferIds: ['offer-hdfc-nocost']
            });
        });
    });

    describe('payment data', () => {
        const user = userEvent.setup();

        const mountEmi = (props: Partial<EMIConfiguration> = {}) => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, { ...baseProps, supportedPaymentMethods: [schemePaymentMethod], ...props });

            render(emi.render());

            return emi;
        };

        /** `emiPlan` is a sibling of `paymentMethod`, the position Card gives `installments`. */
        test('should place emiPlan next to paymentMethod, never inside it', () => {
            const data = mountEmi().formatData() as Record<string, Record<string, unknown>>;

            expect(data.emiPlan).toBeDefined();
            expect(data.paymentMethod).not.toHaveProperty('emiPlan');
        });

        test('should leave the payment data of the child untouched', () => {
            const data = mountEmi().formatData() as Record<string, Record<string, unknown>>;

            expect(data.paymentMethod).toHaveProperty('type', TxVariants.scheme);
            expect(data).toHaveProperty('browserInfo');
        });

        test('should send no emiPlan when no plans were configured', () => {
            const emi = mountEmi({ plans: undefined, session: core.session });

            expect(emi.formatData()).not.toHaveProperty('emiPlan');
        });

        test('should send the plan the shopper switched to', async () => {
            const emi = mountEmi();

            await user.click(screen.getByLabelText('Plan'));
            await user.click(within(screen.getAllByRole('listbox')[1]).getByRole('option', { name: /6 months/i }));

            expect(emi.formatData()).toHaveProperty('emiPlan', {
                tenureMonths: 6,
                issuerName: 'HDFC',
                fundingSource: 'credit',
                planType: 'STANDARD',
                interestRateBps: 1550
            });
        });

        test('should send the provider the shopper switched to, with that provider first plan', async () => {
            const emi = mountEmi();
            const [, icici] = emiPlansResponseMock.issuers;

            await user.click(screen.getByLabelText('Provider'));
            await user.click(within(screen.getAllByRole('listbox')[0]).getByRole('option', { name: new RegExp(icici.issuerName, 'i') }));

            expect(emi.formatData()).toHaveProperty('emiPlan', {
                tenureMonths: 3,
                issuerName: 'ICICI',
                fundingSource: 'credit',
                planType: 'LOW_COST',
                interestRateBps: 750,
                appliedOfferIds: ['offer-icici-lowcost']
            });
        });

        /** The `data` getter is what both submission paths read, so the payload has to survive it. */
        test('should expose emiPlan on the data getter, alongside the wrapping it adds', () => {
            const data: PaymentData & { emiPlan?: EmiPlanPayload } = mountEmi().data;

            expect(data.emiPlan).toEqual(expect.objectContaining({ issuerName: 'HDFC', planType: 'NO_COST' }));
            expect(data.paymentMethod).toHaveProperty('type', TxVariants.scheme);
            expect(data.paymentMethod).toHaveProperty('checkoutAttemptId');
            expect(data).toHaveProperty('clientStateDataIndicator', true);
        });
    });

    describe('plans configuration', () => {
        const createEmiWith = (props: Partial<EMIConfiguration>) => {
            const coreWithEmi = createCoreWithEmi(true);

            return new EMI(coreWithEmi, { ...baseProps, supportedPaymentMethods: [schemePaymentMethod], ...props });
        };

        test('should render nothing and warn when there are no plans and no session', () => {
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
            const emi = createEmiWith({ plans: undefined });

            const { container } = render(emi.render());

            expect(container.innerHTML).toBe('');
            expect(warn).toHaveBeenCalledTimes(1);
            expect(warn).toHaveBeenCalledWith(expect.stringContaining('No installment plans available'));
            warn.mockRestore();
        });

        test('should reject isAvailable when there are no plans and no session', async () => {
            const emi = createEmiWith({ plans: undefined });

            await expect(emi.isAvailable()).rejects.toThrow('EMI: No installment plans available');
        });

        test('should reject isAvailable when the response holds no usable plan', async () => {
            const emi = createEmiWith({ plans: emiPlansEmptyResponseMock });

            await expect(emi.isAvailable()).rejects.toThrow('EMI: No installment plans available');
        });

        /**
         * Once the lookup starts answering with debit issuers, a shopper offered nothing else is offered no EMI
         * by this version, the same way an amount without plans is: a tile that shows credit card plans only.
         */
        test('should offer no EMI when every issuer of the response is a debit one', async () => {
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
            const emi = createEmiWith({ plans: emiPlansDebitOnlyResponseMock });

            const { container } = render(emi.render());

            expect(container.innerHTML).toBe('');
            await expect(emi.isAvailable()).rejects.toThrow('EMI: No installment plans available');
            warn.mockRestore();
        });

        test('should offer the credit issuers of a response that also carries debit ones', () => {
            const emi = createEmiWith({ plans: { issuers: [emiDebitIssuerMock, ...emiPlansResponseMock.issuers] } });

            render(emi.render());

            const providerOptions = within(screen.getAllByRole('listbox')[0]).getAllByRole('option');

            expect(providerOptions).toHaveLength(emiPlansResponseMock.issuers.length);
            expect(screen.getByLabelText('Provider')).toHaveTextContent(hdfc.issuerName);
        });

        test('should resolve isAvailable when a session is present without plans', async () => {
            const emi = createEmiWith({ plans: undefined, session: core.session });

            await expect(emi.isAvailable()).resolves.toBeUndefined();
        });

        test('should render the Phase 1 card form when a session is present without plans', () => {
            const emi = createEmiWith({ plans: undefined, session: core.session });

            render(emi.render());

            expect(screen.queryAllByRole('heading')).toHaveLength(0);
            expect(screen.queryByLabelText('Provider')).toBeNull();
            expect(screen.getByRole('form')).toBeInTheDocument();
        });

        test('should use the plans prop rather than the session, so no second lookup is ever needed', () => {
            const emi = createEmiWith({ session: core.session });

            render(emi.render());

            expect(screen.getByLabelText('Provider')).toHaveTextContent(hdfc.issuerName);
        });

        test('should offer no EMI, rather than fail to render, when the plans object carries no issuers', () => {
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
            const emi = createEmiWith({ plans: {} as unknown as EMIConfiguration['plans'] });

            const { container } = render(emi.render());

            expect(container.innerHTML).toBe('');
            warn.mockRestore();
        });
    });

    describe('analytics', () => {
        const user = userEvent.setup();

        const setupAnalytics = (props: Partial<EMIConfiguration> = {}, hasSupportedScheme = true) => {
            const coreWithEmi = createCoreWithEmi(hasSupportedScheme);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                ...(hasSupportedScheme && { supportedPaymentMethods: [schemePaymentMethod] }),
                ...props
            });

            return { emi, sendAnalytics: coreWithEmi.modules.analytics.sendAnalytics as jest.Mock };
        };

        const eventsOfType = (sendAnalytics: jest.Mock, type: InfoEventType) =>
            sendAnalytics.mock.calls.map(([event]) => event).filter(event => event.type === type);

        describe('rendered event', () => {
            test('should track the funding source rendered', () => {
                const { emi, sendAnalytics } = setupAnalytics();
                render(emi.render());
                expect(sendAnalytics).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: InfoEventType.rendered,
                        component: TxVariants.emi,
                        configData: {
                            showPayButton: true,
                            fundingSource: TxVariants.card
                        }
                    })
                );
            });

            test('should carry no merchant configuration at all, not even a configured amount', () => {
                const { emi, sendAnalytics } = setupAnalytics({
                    amount: { value: 15499900, currency: 'INR' },
                    supportedPaymentMethodsConfiguration: { card: { hasHolderName: true } }
                });

                render(emi.render());
                const [rendered] = eventsOfType(sendAnalytics, InfoEventType.rendered);

                expect(Object.keys(rendered.configData).sort()).toEqual(['fundingSource', 'showPayButton']);
            });

            test('should report the absence of a funding source rather than omitting it', () => {
                const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
                const { emi, sendAnalytics } = setupAnalytics({}, false);
                render(emi.render());
                expect(eventsOfType(sendAnalytics, InfoEventType.rendered)[0].configData).toHaveProperty('fundingSource', 'none');
                warn.mockRestore();
            });
        });

        describe('select displayed events', () => {
            test('should report both selects together with the values preselected on the shopper behalf', () => {
                const { emi, sendAnalytics } = setupAnalytics();
                render(emi.render());
                expect(eventsOfType(sendAnalytics, InfoEventType.displayed)).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            component: TxVariants.emi,
                            target: UiTarget.emiProvider,
                            presentedValues: emiPlansResponseMock.issuers.map(issuer => issuer.issuerCode),
                            selectedValue: hdfc.issuerCode
                        }),
                        expect.objectContaining({
                            component: TxVariants.emi,
                            target: UiTarget.emiPlan,
                            presentedValues: ['3', '6'],
                            selectedValue: '3'
                        })
                    ])
                );
            });

            test('should report the plans of a provider the shopper picks, with its first plan preselected', async () => {
                const { emi, sendAnalytics } = setupAnalytics();
                const [, icici] = emiPlansResponseMock.issuers;
                render(emi.render());
                await user.click(screen.getByLabelText('Provider'));
                await user.click(within(screen.getAllByRole('listbox')[0]).getByRole('option', { name: new RegExp(icici.issuerName, 'i') }));
                expect(sendAnalytics).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: InfoEventType.displayed,
                        target: UiTarget.emiPlan,
                        presentedValues: ['3', '9'],
                        selectedValue: '3'
                    })
                );
            });

            test('should report the provider select once regardless of plan changes', async () => {
                const { emi, sendAnalytics } = setupAnalytics();
                render(emi.render());
                await user.click(screen.getByLabelText('Plan'));
                await user.click(within(screen.getAllByRole('listbox')[1]).getByRole('option', { name: /6 months/i }));
                const providerEvents = eventsOfType(sendAnalytics, InfoEventType.displayed).filter(event => event.target === UiTarget.emiProvider);
                expect(providerEvents).toHaveLength(1);
            });
        });

        describe('selection events', () => {
            test('should send no selected event for the plan the component preselects', () => {
                const { emi, sendAnalytics } = setupAnalytics();
                render(emi.render());
                expect(eventsOfType(sendAnalytics, InfoEventType.selected)).toHaveLength(0);
            });

            test('should report a plan the shopper picks', async () => {
                const { emi, sendAnalytics } = setupAnalytics();
                render(emi.render());
                await user.click(screen.getByLabelText('Plan'));
                await user.click(within(screen.getAllByRole('listbox')[1]).getByRole('option', { name: /6 months/i }));
                expect(sendAnalytics).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: InfoEventType.selected,
                        component: TxVariants.emi,
                        target: UiTarget.emiPlan,
                        issuer: hdfc.issuerCode
                    })
                );
            });

            test('should report a provider the shopper picks exactly once', async () => {
                const { emi, sendAnalytics } = setupAnalytics();
                const [, icici] = emiPlansResponseMock.issuers;
                render(emi.render());
                await user.click(screen.getByLabelText('Provider'));
                await user.click(within(screen.getAllByRole('listbox')[0]).getByRole('option', { name: new RegExp(icici.issuerName, 'i') }));
                const selected = eventsOfType(sendAnalytics, InfoEventType.selected);
                expect(selected).toHaveLength(1);
                expect(selected[0]).toEqual(
                    expect.objectContaining({
                        target: UiTarget.emiProvider,
                        issuer: icici.issuerCode
                    })
                );
            });
        });

        describe('discount banner event', () => {
            test('should report the banner shown for the preselected plan', () => {
                const { emi, sendAnalytics } = setupAnalytics();
                render(emi.render());
                expect(sendAnalytics).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: InfoEventType.displayed,
                        component: TxVariants.emi,
                        target: UiTarget.emiDiscountBanner,
                        issuer: hdfc.issuerCode
                    })
                );
            });

            test('should report nothing when the shopper picks a plan carrying no offer', async () => {
                const { emi, sendAnalytics } = setupAnalytics();
                render(emi.render());
                const bannersOnMount = eventsOfType(sendAnalytics, InfoEventType.displayed).length;
                await user.click(screen.getByLabelText('Plan'));
                await user.click(within(screen.getAllByRole('listbox')[1]).getByRole('option', { name: /6 months/i }));
                expect(hdfc.plans[1].offers).toBeUndefined();
                expect(eventsOfType(sendAnalytics, InfoEventType.displayed)).toHaveLength(bannersOnMount);
            });
        });

        describe('error events', () => {
            test('should report the dropped tile when no payment method is supported', async () => {
                const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
                const { emi, sendAnalytics } = setupAnalytics({}, false);
                await expect(emi.isAvailable()).rejects.toThrow('EMI: No valid supported payment methods available');
                expect(sendAnalytics).toHaveBeenCalledWith(
                    expect.objectContaining({
                        component: TxVariants.emi,
                        errorType: ErrorEventType.implementation,
                        code: ErrorEventCode.EMI_NO_SUPPORTED_PAYMENT_METHOD,
                        message: 'EMI: No valid supported payment methods available'
                    })
                );
                warn.mockRestore();
            });

            test('should report the dropped tile when no installment plan is available', async () => {
                const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
                const { emi, sendAnalytics } = setupAnalytics({ plans: undefined });
                await expect(emi.isAvailable()).rejects.toThrow('EMI: No installment plans available');
                expect(sendAnalytics).toHaveBeenCalledWith(
                    expect.objectContaining({
                        errorType: ErrorEventType.implementation,
                        code: ErrorEventCode.EMI_NO_INSTALLMENT_PLANS
                    })
                );
                warn.mockRestore();
            });
        });

        test('should carry no amount, and no data of the card the shopper is filling in', async () => {
            const { emi, sendAnalytics } = setupAnalytics({ amount: { value: 15499900, currency: 'INR' } });
            render(emi.render());
            await user.click(screen.getByLabelText('Provider'));
            await user.click(within(screen.getAllByRole('listbox')[0]).getByRole('option', { name: new RegExp(hdfc.issuerName, 'i') }));
            const payload = JSON.stringify(sendAnalytics.mock.calls.map(([event]) => event));
            expect(payload).not.toContain('5166633');
            expect(payload).not.toContain('INR');
            expect(payload).not.toContain('transactionAmounts');
            expect(payload).not.toContain('encryptedCardNumber');
        });
    });
});
