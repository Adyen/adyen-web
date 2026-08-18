import { render, screen, within } from '@testing-library/preact';
import EMI from './EMI';
import CardElement from '../Card';
import { TxVariants } from '../tx-variants';
import { Resources } from '../../core/Context/Resources';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import PaymentMethods from '../../core/ProcessResponse/PaymentMethods';
import { AdyenCheckout, ThreeDS2Challenge, ThreeDS2DeviceFingerprint } from '../../index';
import { emiPlansEmptyResponseMock, emiPlansResponseMock } from './stories/mocks';
import type { PaymentActionsType } from '../../types/global-types';
import type { EMIConfiguration } from './types';

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

    describe('mixed funding sources', () => {
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

        test('should resolve isAvailable when at least one funding source is supported', async () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod, upiPaymentMethod]
            });

            await expect(emi.isAvailable()).resolves.toBeUndefined();
        });

        test('should render card form with mixed funding sources', () => {
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
        test('should resolve when valid funding sources exist', async () => {
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

            await expect(emi.isAvailable()).rejects.toThrow('EMI: No valid funding sources available');
        });

        test('should reject when supportedPaymentMethods contains unsupported rail', async () => {
            const coreWithEmi = createCoreWithEmi(false);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [{ type: 'unsupported_rail' }]
            });

            await expect(emi.isAvailable()).rejects.toThrow('EMI: No valid funding sources available');
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

        test('should not include emiPlan in formatData once a plan is selected', () => {
            const coreWithEmi = createCoreWithEmi(true);
            const emi = new EMI(coreWithEmi, {
                ...baseProps,
                supportedPaymentMethods: [schemePaymentMethod]
            });

            render(emi.render());

            expect(emi.formatData()).not.toHaveProperty('emiPlan');
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

        test('should throw when the plans response was passed unparsed', () => {
            const unparsedPlans = JSON.stringify(emiPlansResponseMock) as unknown as EMIConfiguration['plans'];

            expect(() => createEmiWith({ plans: unparsedPlans })).toThrow(/a string was provided/);
        });

        test('should throw when only the issuers of the plans response were passed', () => {
            const partialPlans = emiPlansResponseMock.issuers as unknown as EMIConfiguration['plans'];

            expect(() => createEmiWith({ plans: partialPlans })).toThrow(/an array was provided/);
        });

        test('should warn and offer no EMI when the plans object carries no issuers', () => {
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
            const emi = createEmiWith({ plans: {} as unknown as EMIConfiguration['plans'] });

            const { container } = render(emi.render());

            expect(container.innerHTML).toBe('');
            expect(warn).toHaveBeenCalledWith(expect.stringContaining('no `issuers` array'));
            warn.mockRestore();
        });
    });
});
