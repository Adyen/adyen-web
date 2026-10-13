import { render, screen, waitFor, within } from '@testing-library/preact';
import userEvent from '@testing-library/user-event';
import EMI from './EMI';
import CardElement from '../Card';
import { TxVariants } from '../tx-variants';
import { Resources } from '../../core/Context/Resources';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import PaymentMethods from '../../core/ProcessResponse/PaymentMethods';
import AdyenCheckoutError from '../../core/Errors/AdyenCheckoutError';
import { AdyenCheckout, ThreeDS2Challenge, ThreeDS2DeviceFingerprint } from '../../index';
import { InfoEventType, UiTarget } from '../../core/Analytics/events/AnalyticsInfoEvent';
import { AnalyticsErrorEvent, ErrorEventCode, ErrorEventType } from '../../core/Analytics/events/AnalyticsErrorEvent';
import { getEmiPlans } from './services/getEmiPlans';
import { EMI_NO_INSTALLMENT_PLANS, EMI_PLANS_TIMEOUT_MS } from './constants';
import { emiPaymentMethodMock, emiPlansEmptyResponseMock, emiPlansResponseMock } from './stories/mocks';
import type { PaymentActionsType, PaymentData, RawPaymentMethod } from '../../types/global-types';
import type { EMIConfiguration, EmiPaymentMethodEntry, EmiPlanPayload, EmiPlansResponse, SupportedPaymentMethod } from './types';

jest.mock('./services/getEmiPlans');

const mockedGetEmiPlans = getEmiPlans as jest.MockedFunction<typeof getEmiPlans>;

const core = setupCoreMock();

const CLIENT_KEY = 'test_clientkey';

const baseProps = {
    i18n: core.modules.i18n,
    clientKey: CLIENT_KEY,
    loadingContext: 'test',
    modules: { resources: new Resources('test') }
};

const [hdfc, icici] = emiPlansResponseMock.issuers;

const schemePaymentMethod = {
    type: 'scheme',
    name: 'Card',
    brands: ['visa', 'mc']
};
const upiPaymentMethod = { type: 'upi', name: 'UPI' };

function createCoreWithEmi(hasSupportedScheme = true, entry: EmiPaymentMethodEntry = {}) {
    const emiEntry = {
        ...emiPaymentMethodMock,
        ...(!hasSupportedScheme && { supportedPaymentMethods: undefined }),
        ...entry
    } as RawPaymentMethod;

    return setupCoreMock({
        paymentMethods: new PaymentMethods({
            paymentMethods: [emiEntry, schemePaymentMethod]
        })
    });
}

const createEmi = (props: Partial<EMIConfiguration> = {}, hasSupportedScheme = true, entry: EmiPaymentMethodEntry = {}) => {
    const coreWithEmi = createCoreWithEmi(hasSupportedScheme, entry);
    const emi = new EMI(coreWithEmi, { ...baseProps, ...props });

    return {
        emi,
        coreWithEmi,
        sendAnalytics: coreWithEmi.modules.analytics.sendAnalytics as jest.Mock
    };
};

const splitFundingSourceSchemes: RawPaymentMethod[] = [
    {
        type: 'scheme',
        name: 'Debit Card',
        fundingSource: 'debit',
        brands: ['maestro']
    },
    {
        type: 'scheme',
        name: 'Credit Card',
        fundingSource: 'credit',
        brands: ['visa', 'mc', 'amex']
    }
];

function createCoreWithSplitSchemes(supportedPaymentMethods: SupportedPaymentMethod[]) {
    const paymentMethods = {
        paymentMethods: [{ ...emiPaymentMethodMock, supportedPaymentMethods } as RawPaymentMethod, ...splitFundingSourceSchemes]
    };

    return setupCoreMock({ paymentMethods: new PaymentMethods(paymentMethods) });
}

const cardOf = (emi: EMI): CardElement => {
    const { card } = emi;
    if (!card) throw new Error('EMI created no Card child');
    return card;
};

const renderWithPlans = async (emi: EMI) => {
    const view = render(emi.render());
    await screen.findByLabelText('Provider');
    await waitFor(() => expect(emi.formatData()).toHaveProperty('emiPlan'));

    return view;
};

const apiError = (body: {
    type: string;
    title: string;
    status: number;
    errorCode: string;
    detail?: string;
    requestId?: string;
    invalidFields?: { name: string; value: string; message: string }[];
}) => new AdyenCheckoutError('NETWORK_ERROR', 'Service is not available', { cause: body });

const tokenValidationError = () =>
    apiError({
        type: 'https://docs.adyen.com/errors/unprocessable-entity',
        errorCode: '999_422_001',
        title: 'Missing or invalid input fields',
        detail: '',
        requestId: '2918b6b202e24fd91e0689b804e74ee4',
        status: 422,
        invalidFields: [{ name: 'emiToken', value: '***REDACTED***', message: 'EMI token cannot be decoded.' }]
    });

const errorEvents = (sendAnalytics: jest.Mock) =>
    sendAnalytics.mock.calls.map(([event]) => event).filter((event): event is AnalyticsErrorEvent => event instanceof AnalyticsErrorEvent);

const eventsOfType = (sendAnalytics: jest.Mock, type: InfoEventType) =>
    sendAnalytics.mock.calls.map(([event]) => event).filter(event => event.type === type);

const validationErrorEvents = (sendAnalytics: jest.Mock) => eventsOfType(sendAnalytics, InfoEventType.validationError);

describe('EMI', () => {
    beforeEach(() => {
        mockedGetEmiPlans.mockReset();
        mockedGetEmiPlans.mockResolvedValue(emiPlansResponseMock);
    });

    describe('formatData', () => {
        test('should delegate to Card formatData when scheme is supported', () => {
            const { emi } = createEmi();

            const data = emi.formatData();
            expect(data).toHaveProperty('paymentMethod');
            expect(data.paymentMethod).toHaveProperty('type', TxVariants.scheme);
        });

        test('should return only the EMI payment method type when scheme is not supported', () => {
            const { emi } = createEmi({}, false);

            expect(emi.formatData()).toEqual({
                paymentMethod: { type: TxVariants.emi }
            });
        });

        test('should not include emiPlan while no plan has been selected', () => {
            const { emi } = createEmi();

            expect(emi.formatData()).not.toHaveProperty('emiPlan');
        });
    });

    describe('isValid', () => {
        test('should return false when no scheme is supported', () => {
            const { emi } = createEmi({}, false);

            expect(emi.isValid).toBe(false);
        });

        test('should return false initially when scheme is supported (card not yet filled)', () => {
            const { emi } = createEmi();

            expect(emi.isValid).toBe(false);
        });

        test('should return false without a selected plan, even when the card is valid', () => {
            const { emi } = createEmi();
            jest.spyOn(cardOf(emi), 'isValid', 'get').mockReturnValue(true);

            expect(emi.isValid).toBe(false);
        });

        test('should return true once a plan is selected and the card is valid', async () => {
            const { emi } = createEmi();
            jest.spyOn(cardOf(emi), 'isValid', 'get').mockReturnValue(true);

            await renderWithPlans(emi);

            expect(emi.isValid).toBe(true);
        });

        test('should return false with a selected plan while the card is invalid', async () => {
            const { emi } = createEmi();

            await renderWithPlans(emi);

            expect(emi.isValid).toBe(false);
        });
    });

    describe('showValidation', () => {
        test('should not throw when no scheme is supported', () => {
            const { emi } = createEmi({}, false);

            expect(() => emi.showValidation()).not.toThrow();
        });

        test('should delegate to card when scheme is supported', () => {
            const { emi } = createEmi();

            expect(() => emi.showValidation()).not.toThrow();
        });
    });

    describe('setStatus', () => {
        test('should not throw when no scheme is supported', () => {
            const { emi } = createEmi({}, false);

            expect(() => emi.setStatus('loading')).not.toThrow();
        });
    });

    describe('unsupported scheme rail', () => {
        test('should not create Card child when the entry lists no scheme', () => {
            const { emi } = createEmi({}, false);

            expect(emi.card).toBeUndefined();
            expect(emi.isValid).toBe(false);
        });

        test('should render empty body, and fetch no plans, when scheme is not supported', () => {
            const { emi } = createEmi({}, false);

            const { container } = render(emi.render());
            expect(container.innerHTML).toBe('');
            expect(mockedGetEmiPlans).not.toHaveBeenCalled();
        });

        test('should not initialize card when the entry lists an unsupported rail only', () => {
            const { emi } = createEmi({}, true, {
                supportedPaymentMethods: [{ type: 'unsupported_rail' }]
            });

            expect(emi.card).toBeUndefined();
            expect(emi.isValid).toBe(false);
        });

        test('should offer nothing at all when every rail of the response is one it does not render', async () => {
            const { emi } = createEmi({}, true, {
                supportedPaymentMethods: [upiPaymentMethod, { type: 'unsupported_rail' }]
            });

            const { container } = render(emi.render());

            expect(emi.card).toBeUndefined();
            expect(container.innerHTML).toBe('');
            await expect(emi.isAvailable()).rejects.toThrow('EMI: No valid supported payment methods available');
        });
    });

    describe('mixed supported payment methods', () => {
        test('should create Card when the entry lists both scheme and upi', () => {
            const { emi } = createEmi({}, true, {
                supportedPaymentMethods: [schemePaymentMethod, upiPaymentMethod]
            });

            expect(emi.card).toBeDefined();
            expect(emi.card).toBeInstanceOf(CardElement);
        });

        test('should resolve isAvailable when at least one payment method is supported', async () => {
            const { emi } = createEmi({}, true, {
                supportedPaymentMethods: [schemePaymentMethod, upiPaymentMethod]
            });

            await expect(emi.isAvailable()).resolves.toBeUndefined();
        });

        test('should render card form with mixed supported payment methods', async () => {
            const { emi } = createEmi({}, true, {
                supportedPaymentMethods: [schemePaymentMethod, upiPaymentMethod]
            });

            await renderWithPlans(emi);

            expect(screen.getByRole('form')).toBeInTheDocument();
        });

        test('should initialize Card even when scheme is not the first entry', async () => {
            const { emi } = createEmi({}, true, {
                supportedPaymentMethods: [upiPaymentMethod, schemePaymentMethod]
            });

            expect(emi.card).toBeDefined();
            expect(emi.card).toBeInstanceOf(CardElement);

            await renderWithPlans(emi);
            expect(screen.getByRole('form')).toBeInTheDocument();
        });
    });

    describe('backend-owned fields', () => {
        test('should ignore supportedPaymentMethods passed as configuration when the entry lists none', async () => {
            const { emi } = createEmi(
                {
                    supportedPaymentMethods: [schemePaymentMethod]
                } as Partial<EMIConfiguration>,
                false
            );

            expect(emi.card).toBeUndefined();
            await expect(emi.isAvailable()).rejects.toThrow('EMI: No valid supported payment methods available');
        });

        test('should keep the supported payment methods of the entry over those passed as configuration', () => {
            const { emi } = createEmi({
                supportedPaymentMethods: [upiPaymentMethod]
            } as Partial<EMIConfiguration>);

            expect(emi.card).toBeInstanceOf(CardElement);
        });

        test('should ignore plans passed as configuration, and fetch them instead', async () => {
            mockedGetEmiPlans.mockResolvedValue({ issuers: [icici] });
            const { emi } = createEmi({
                plans: emiPlansResponseMock
            } as Partial<EMIConfiguration>);

            await renderWithPlans(emi);

            expect(screen.getByLabelText('Provider')).toHaveTextContent(icici.issuerName);
        });
    });

    describe('card getter', () => {
        test('should return CardElement when scheme is supported', () => {
            const { emi } = createEmi();

            expect(emi.card).toBeDefined();
            expect((emi.card?.constructor as { type?: string })?.type).toBe(TxVariants.scheme);
        });

        test('should return undefined when scheme is not supported', () => {
            const { emi } = createEmi({}, false);

            expect(emi.card).toBeUndefined();
        });
    });

    describe('prop overrides', () => {
        test('should pass forced overrides to CardElement alongside user config', () => {
            const onBinLookupMock = jest.fn();

            const { emi } = createEmi({
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

            expect(card?.props._disableClickToPay).toBe(true);
            expect(card?.props.showPayButton).toBe(false);

            expect(card?.props.hasHolderName).toBe(false);
            expect(card?.props.onBinLookup).toBe(onBinLookupMock);
        });
    });

    describe('brands', () => {
        test('should take the brands of the matched entry, not those of the first scheme in the response', () => {
            const supportedPaymentMethods = [{ type: 'scheme', name: 'Cards', brands: ['mc', 'rupay', 'visa'] }];
            const emi = new EMI(createCoreWithSplitSchemes(supportedPaymentMethods), baseProps);

            expect(emi.card?.props.brands).toEqual(['mc', 'rupay', 'visa']);
        });

        test('should fall back to the brands resolved from the response when the matched entry carries none', () => {
            const supportedPaymentMethods = [{ type: 'scheme', name: 'Cards' }];
            const emi = new EMI(createCoreWithSplitSchemes(supportedPaymentMethods), baseProps);

            expect(emi.card?.props.brands).toEqual(['maestro']);
        });

        test('should let the card configuration override the brands of the matched entry', () => {
            const supportedPaymentMethods = [{ type: 'scheme', name: 'Cards', brands: ['mc', 'rupay', 'visa'] }];
            const emi = new EMI(createCoreWithSplitSchemes(supportedPaymentMethods), {
                ...baseProps,
                supportedPaymentMethodsConfiguration: { card: { brands: ['rupay'] } }
            });

            expect(emi.card?.props.brands).toEqual(['rupay']);
        });
    });

    describe('child card funding source', () => {
        test('should send no funding source, whichever scheme the response lists first', () => {
            const supportedPaymentMethods = [{ type: 'scheme', name: 'Cards', brands: ['mc', 'rupay', 'visa'] }];
            const emi = new EMI(createCoreWithSplitSchemes(supportedPaymentMethods), baseProps);

            const data = emi.formatData();

            expect(emi.card?.props.fundingSource).toBeUndefined();
            expect(data.paymentMethod).not.toHaveProperty('fundingSource');
        });

        test('should send no funding source even when one is configured on the card', () => {
            const supportedPaymentMethods = [{ type: 'scheme', name: 'Cards' }];
            const emi = new EMI(createCoreWithSplitSchemes(supportedPaymentMethods), {
                ...baseProps,
                supportedPaymentMethodsConfiguration: {
                    card: { fundingSource: 'debit' } as never
                }
            });

            const data = emi.formatData();

            expect(emi.card?.props.fundingSource).toBeUndefined();
            expect(data.paymentMethod).not.toHaveProperty('fundingSource');
        });

        test('should keep the config it resolved from the response, which a funding source lookup would lose', () => {
            const supportedPaymentMethods = [{ type: 'scheme', name: 'Cards' }];
            const emi = new EMI(createCoreWithSplitSchemes(supportedPaymentMethods), baseProps);

            expect(emi.card?.props.brands).toEqual(['maestro']);
        });
    });

    describe('delegation', () => {
        test('formatData delegates to the active supported payment method element', () => {
            const { emi } = createEmi();

            const card = emi.card;
            expect(card).toBeDefined();

            const cardFormatData = card?.formatData();
            const emiFormatData = emi.formatData();

            expect(emiFormatData).toEqual(cardFormatData);
        });
    });

    describe('submit and custom payment button', () => {
        test('submit triggers showValidation when card is invalid', () => {
            const { emi } = createEmi({ showPayButton: false });

            const showValidationSpy = jest.spyOn(emi, 'showValidation');

            emi.submit();

            expect(showValidationSpy).toHaveBeenCalled();
            showValidationSpy.mockRestore();
        });

        test('native pay button omits the amount', async () => {
            const { emi } = createEmi({ amount: { value: 100000, currency: 'INR' } });

            await renderWithPlans(emi);

            expect(screen.getByRole('button', { name: 'Pay' })).toBeInTheDocument();
        });

        test('native pay button is not rendered when showPayButton is false', async () => {
            const { emi } = createEmi({ showPayButton: false });

            await renderWithPlans(emi);
            expect(screen.queryByRole('button', { name: /pay/i })).toBeNull();
        });
    });

    describe('onChange', () => {
        test('should call onChange prop on EMI when Card child state changes', () => {
            const onChangeMock = jest.fn();

            const { emi } = createEmi({ onChange: onChangeMock });

            expect(emi.card).toBeDefined();

            emi.card?.setState({ data: { cardNumber: '4111111111111111' } });

            expect(onChangeMock).toHaveBeenCalled();
        });

        test('should not throw when onChange is not provided', () => {
            const { emi } = createEmi();

            expect(() => emi.card?.setState({ data: {} })).not.toThrow();
        });
    });

    describe('isAvailable', () => {
        test('should resolve when valid supported payment methods exist, without fetching the plans', async () => {
            const { emi } = createEmi();

            await expect(emi.isAvailable()).resolves.toBeUndefined();
            expect(mockedGetEmiPlans).not.toHaveBeenCalled();
        });

        test('should reject with an AdyenCheckoutError when the entry lists no supported payment methods', async () => {
            const { emi } = createEmi({}, false);

            const rejection = emi.isAvailable();

            await expect(rejection).rejects.toBeInstanceOf(AdyenCheckoutError);
            await expect(rejection).rejects.toThrow('EMI: No valid supported payment methods available');
        });

        test('should reject when the entry lists an unsupported rail only', async () => {
            const { emi } = createEmi({}, true, {
                supportedPaymentMethods: [{ type: 'unsupported_rail' }]
            });

            await expect(emi.isAvailable()).rejects.toThrow('EMI: No valid supported payment methods available');
        });

        test('should resolve even when the backend has no plans to offer', async () => {
            mockedGetEmiPlans.mockResolvedValue(emiPlansEmptyResponseMock);
            const { emi } = createEmi();

            await expect(emi.isAvailable()).resolves.toBeUndefined();
        });
    });

    describe('loading the plans', () => {
        test('should not request the plans before the component renders', async () => {
            const { emi } = createEmi();

            await emi.isAvailable();

            expect(mockedGetEmiPlans).not.toHaveBeenCalled();
        });

        test('should request the plans once on the first render, with the token of the entry', async () => {
            const { emi } = createEmi();

            await renderWithPlans(emi);

            expect(mockedGetEmiPlans).toHaveBeenCalledTimes(1);
            expect(mockedGetEmiPlans).toHaveBeenCalledWith({
                emiToken: emiPaymentMethodMock.configuration?.emiToken,
                clientKey: CLIENT_KEY,
                loadingContext: 'test',
                timeout: EMI_PLANS_TIMEOUT_MS
            });
        });

        test('should not request the plans again on a second render, and show them without a spinner', async () => {
            const { emi } = createEmi();

            const { unmount } = await renderWithPlans(emi);
            unmount();

            render(emi.render());

            expect(screen.getByLabelText('Provider')).toHaveTextContent(hdfc.issuerName);
            expect(mockedGetEmiPlans).toHaveBeenCalledTimes(1);
        });

        test('should not request the plans again on a second render after a failure', async () => {
            mockedGetEmiPlans.mockRejectedValue(
                new AdyenCheckoutError('NETWORK_ERROR', 'failed', {
                    cause: new TypeError('Failed to fetch')
                })
            );
            const { emi, sendAnalytics } = createEmi();

            const { unmount } = render(emi.render());
            await waitFor(() => expect(errorEvents(sendAnalytics)).toHaveLength(1));
            unmount();

            render(emi.render());

            expect(screen.getByTestId('spinner')).toBeInTheDocument();
            expect(mockedGetEmiPlans).toHaveBeenCalledTimes(1);
            expect(errorEvents(sendAnalytics)).toHaveLength(1);
        });

        test('should request the plans without a token when the entry carries none', async () => {
            mockedGetEmiPlans.mockRejectedValue(tokenValidationError());
            const { emi, sendAnalytics } = createEmi({}, true, { configuration: {} });

            render(emi.render());

            await waitFor(() => expect(errorEvents(sendAnalytics)).toHaveLength(1));
            expect(mockedGetEmiPlans).toHaveBeenCalledWith(expect.objectContaining({ emiToken: undefined }));
            expect(errorEvents(sendAnalytics)[0]).toEqual(
                expect.objectContaining({
                    code: ErrorEventCode.EMI_PLANS_TOKEN_INVALID
                })
            );
        });

        test('should show a spinner first, and the plans and the card form once they arrive', async () => {
            const { emi } = createEmi();

            render(emi.render());

            expect(screen.getByTestId('spinner')).toBeInTheDocument();
            expect(screen.queryByRole('form')).toBeNull();

            expect(await screen.findByLabelText('Provider')).toHaveTextContent(hdfc.issuerName);
            expect(screen.getByRole('form')).toBeInTheDocument();
        });

        test.each<[string, () => void]>([
            ['the response holds no issuer', () => mockedGetEmiPlans.mockResolvedValue(emiPlansEmptyResponseMock)],
            ['the token is rejected', () => mockedGetEmiPlans.mockRejectedValue(tokenValidationError())],
            ['the request fails', () => mockedGetEmiPlans.mockRejectedValue(new AdyenCheckoutError('NETWORK_ERROR', 'Call failed'))]
        ])('should keep the spinner, and render no card form, when %s', async (_case, arrange) => {
            arrange();
            const { emi, sendAnalytics } = createEmi();

            render(emi.render());
            await waitFor(() => expect([...errorEvents(sendAnalytics), ...validationErrorEvents(sendAnalytics)]).toHaveLength(1));

            expect(screen.getByTestId('spinner')).toBeInTheDocument();
            expect(screen.queryByRole('form')).toBeNull();
            expect(screen.queryByLabelText('Provider')).toBeNull();
            expect(screen.queryByRole('button', { name: 'Pay' })).toBeNull();
            expect(emi.formatData()).not.toHaveProperty('emiPlan');
        });
    });

    describe('handleAction (3DS)', () => {
        const paymentMethodsResponse = { paymentMethods: [emiPaymentMethodMock as RawPaymentMethod, schemePaymentMethod] };

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
                clientKey: 'test_123456',
                paymentMethodsResponse
            });

            const emi = new EMI(checkout).mount('body');

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
                srConfig: { enabled: false },
                paymentMethodsResponse
            });

            const emi = new EMI(checkout).mount('body');

            const actionComponent = emi.handleAction(challengeAction);
            expect(actionComponent instanceof ThreeDS2Challenge).toBe(true);
        });
    });

    describe('UI Rendering', () => {
        test('should render card form when scheme is supported', async () => {
            const { emi } = createEmi();

            await renderWithPlans(emi);
            expect(screen.getByRole('form')).toBeInTheDocument();
        });

        test('should render nothing when scheme is not supported', () => {
            const { emi } = createEmi({}, false);

            const { container } = render(emi.render());
            expect(container.innerHTML).toBe('');
        });

        test('should expose subtitle via additionalInfo for Drop-in', () => {
            const { emi } = createEmi();

            expect(emi.additionalInfo).toMatch(/installment plans on credit cards/i);
        });
    });

    describe('plan selection', () => {
        test('should preselect the first issuer and its first plan of the response', async () => {
            const { emi } = createEmi();

            await renderWithPlans(emi);

            expect(screen.getByLabelText('Provider')).toHaveTextContent(hdfc.issuerName);
            expect(screen.getByLabelText('Plan')).toHaveTextContent('₹51,666.33 x 3 months');
            expect(screen.getByRole('form')).toBeInTheDocument();
        });

        test('should offer every issuer the response carries', async () => {
            const { emi } = createEmi();

            await renderWithPlans(emi);

            const providerOptions = within(screen.getAllByRole('listbox')[0]).getAllByRole('option');

            expect(providerOptions).toHaveLength(emiPlansResponseMock.issuers.length);
        });

        test('should include the emiPlan of the preselected plan in formatData', async () => {
            const { emi } = createEmi();

            await renderWithPlans(emi);

            expect(emi.formatData()).toHaveProperty('emiPlan', {
                tenureMonths: 3,
                issuerName: 'HDFC',
                fundingSource: 'credit',
                planType: 'NO_COST',
                interestRateBps: 1550,
                appliedOfferIds: ['offer-hdfc-cashback', 'offer-hdfc-nocost']
            });
        });
    });

    describe('payment data', () => {
        const user = userEvent.setup();

        const mountEmi = async (props: Partial<EMIConfiguration> = {}) => {
            const { emi } = createEmi(props);

            await renderWithPlans(emi);

            return emi;
        };

        test('should place emiPlan next to paymentMethod, never inside it', async () => {
            const data = (await mountEmi()).formatData();

            expect(data.emiPlan).toBeDefined();
            expect(data.paymentMethod).not.toHaveProperty('emiPlan');
        });

        test('should leave the payment data of the child untouched', async () => {
            const data = (await mountEmi()).formatData();

            expect(data.paymentMethod).toHaveProperty('type', TxVariants.scheme);
            expect(data).toHaveProperty('browserInfo');
        });

        test('should send no emiPlan while the plans are loading', () => {
            mockedGetEmiPlans.mockReturnValue(new Promise<EmiPlansResponse>(() => {}));
            const { emi } = createEmi();

            render(emi.render());

            expect(emi.formatData()).not.toHaveProperty('emiPlan');
        });

        test('should send the plan the shopper switched to', async () => {
            const emi = await mountEmi();

            await user.click(screen.getByLabelText('Plan'));
            await user.click(
                within(screen.getAllByRole('listbox')[1]).getByRole('option', {
                    name: /6 months/i
                })
            );

            expect(emi.formatData()).toHaveProperty('emiPlan', {
                tenureMonths: 6,
                issuerName: 'HDFC',
                fundingSource: 'credit',
                planType: 'STANDARD',
                interestRateBps: 1550
            });
        });

        test('should send the provider the shopper switched to, with that provider first plan', async () => {
            const emi = await mountEmi();

            await user.click(screen.getByLabelText('Provider'));
            await user.click(
                within(screen.getAllByRole('listbox')[0]).getByRole('option', {
                    name: new RegExp(icici.issuerName, 'i')
                })
            );

            expect(emi.formatData()).toHaveProperty('emiPlan', {
                tenureMonths: 3,
                issuerName: 'ICICI',
                fundingSource: 'credit',
                planType: 'LOW_COST',
                interestRateBps: 750,
                appliedOfferIds: ['offer-icici-lowcost']
            });
        });

        test('should expose emiPlan on the data getter, alongside the wrapping it adds', async () => {
            const data: PaymentData & { emiPlan?: EmiPlanPayload } = (await mountEmi()).data;

            expect(data.emiPlan).toEqual(expect.objectContaining({ issuerName: 'HDFC', planType: 'NO_COST' }));
            expect(data.paymentMethod).toHaveProperty('type', TxVariants.scheme);
            expect(data.paymentMethod).toHaveProperty('checkoutAttemptId');
            expect(data).toHaveProperty('clientStateDataIndicator', true);
        });
    });

    describe('analytics', () => {
        const user = userEvent.setup();

        describe('rendered event', () => {
            test('should track the funding source rendered', async () => {
                const { emi, sendAnalytics } = createEmi();
                await renderWithPlans(emi);
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

            test('should carry no merchant configuration at all, not even a configured amount', async () => {
                const { emi, sendAnalytics } = createEmi({
                    amount: { value: 15499900, currency: 'INR' },
                    supportedPaymentMethodsConfiguration: {
                        card: { hasHolderName: true }
                    }
                });

                await renderWithPlans(emi);
                const [rendered] = eventsOfType(sendAnalytics, InfoEventType.rendered);

                expect(Object.keys(rendered.configData).sort()).toEqual(['fundingSource', 'showPayButton']);
            });

            test('should report the absence of a funding source rather than omitting it', () => {
                const { emi, sendAnalytics } = createEmi({}, false);
                render(emi.render());
                expect(eventsOfType(sendAnalytics, InfoEventType.rendered)[0].configData).toHaveProperty('fundingSource', 'none');
            });
        });

        describe('select displayed events', () => {
            test('should report both selects together with the values preselected on the shopper behalf', async () => {
                const { emi, sendAnalytics } = createEmi();
                await renderWithPlans(emi);
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
                const { emi, sendAnalytics } = createEmi();
                await renderWithPlans(emi);
                await user.click(screen.getByLabelText('Provider'));
                await user.click(
                    within(screen.getAllByRole('listbox')[0]).getByRole('option', {
                        name: new RegExp(icici.issuerName, 'i')
                    })
                );
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
                const { emi, sendAnalytics } = createEmi();
                await renderWithPlans(emi);
                await user.click(screen.getByLabelText('Plan'));
                await user.click(
                    within(screen.getAllByRole('listbox')[1]).getByRole('option', {
                        name: /6 months/i
                    })
                );
                const providerEvents = eventsOfType(sendAnalytics, InfoEventType.displayed).filter(event => event.target === UiTarget.emiProvider);
                expect(providerEvents).toHaveLength(1);
            });
        });

        describe('selection events', () => {
            test('should send no selected event for the plan the component preselects', async () => {
                const { emi, sendAnalytics } = createEmi();
                await renderWithPlans(emi);
                expect(eventsOfType(sendAnalytics, InfoEventType.selected)).toHaveLength(0);
            });

            test('should report a plan the shopper picks', async () => {
                const { emi, sendAnalytics } = createEmi();
                await renderWithPlans(emi);
                await user.click(screen.getByLabelText('Plan'));
                await user.click(
                    within(screen.getAllByRole('listbox')[1]).getByRole('option', {
                        name: /6 months/i
                    })
                );
                expect(sendAnalytics).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: InfoEventType.selected,
                        component: TxVariants.emi,
                        target: UiTarget.emiPlan,
                        issuer: hdfc.issuerCode,
                        selectedValue: '6'
                    })
                );
            });

            test('should report a provider the shopper picks exactly once', async () => {
                const { emi, sendAnalytics } = createEmi();
                await renderWithPlans(emi);
                await user.click(screen.getByLabelText('Provider'));
                await user.click(
                    within(screen.getAllByRole('listbox')[0]).getByRole('option', {
                        name: new RegExp(icici.issuerName, 'i')
                    })
                );
                const selected = eventsOfType(sendAnalytics, InfoEventType.selected);
                expect(selected).toHaveLength(1);
                expect(selected[0]).toEqual(
                    expect.objectContaining({
                        target: UiTarget.emiProvider,
                        issuer: icici.issuerCode,
                        selectedValue: icici.issuerCode
                    })
                );
            });
        });

        describe('discount banner event', () => {
            test('should report the banner shown for the preselected plan', async () => {
                const { emi, sendAnalytics } = createEmi();
                await renderWithPlans(emi);
                expect(sendAnalytics).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: InfoEventType.displayed,
                        component: TxVariants.emi,
                        target: UiTarget.emiDiscountBanner,
                        issuer: hdfc.issuerCode
                    })
                );
            });

            test('should report nothing when the shopper picks a plan carrying no instant discount', async () => {
                const { emi, sendAnalytics } = createEmi();
                await renderWithPlans(emi);
                const bannersOnMount = eventsOfType(sendAnalytics, InfoEventType.displayed).length;
                await user.click(screen.getByLabelText('Plan'));
                await user.click(
                    within(screen.getAllByRole('listbox')[1]).getByRole('option', {
                        name: /6 months/i
                    })
                );
                expect(hdfc.plans[1].transactionAmounts.totalInstantDiscountAmount).toBeUndefined();
                expect(eventsOfType(sendAnalytics, InfoEventType.displayed)).toHaveLength(bannersOnMount);
            });
        });

        describe('error events', () => {
            test('should report the dropped tile when no payment method is supported', async () => {
                const { emi, sendAnalytics } = createEmi({}, false);
                await expect(emi.isAvailable()).rejects.toThrow('EMI: No valid supported payment methods available');
                expect(sendAnalytics).toHaveBeenCalledWith(
                    expect.objectContaining({
                        component: TxVariants.emi,
                        errorType: ErrorEventType.implementation,
                        code: ErrorEventCode.EMI_NO_SUPPORTED_PAYMENT_METHOD,
                        message: 'EMI: No valid supported payment methods available'
                    })
                );
            });

            test('should send no error and no validation event when the plans arrive', async () => {
                const { emi, sendAnalytics } = createEmi();

                await renderWithPlans(emi);

                expect(errorEvents(sendAnalytics)).toHaveLength(0);
                expect(validationErrorEvents(sendAnalytics)).toHaveLength(0);
            });

            test('should send one no-plans info event, and no error, for an empty issuers list', async () => {
                mockedGetEmiPlans.mockResolvedValue(emiPlansEmptyResponseMock);
                const { emi, sendAnalytics } = createEmi();

                render(emi.render());

                await waitFor(() => expect(validationErrorEvents(sendAnalytics)).toHaveLength(1));
                expect(validationErrorEvents(sendAnalytics)[0]).toEqual(
                    expect.objectContaining({
                        component: TxVariants.emi,
                        type: InfoEventType.validationError,
                        validationErrorCode: EMI_NO_INSTALLMENT_PLANS,
                        validationErrorMessage: 'EMI: No installment plans available'
                    })
                );
                expect(errorEvents(sendAnalytics)).toHaveLength(0);
            });

            const tokenRejectedMessage = 'EMI: /utility/v1/emi/plans (422): Missing or invalid input fields';

            test.each<[string, () => unknown, ErrorEventCode, string]>([
                ['an invalid token', tokenValidationError, ErrorEventCode.EMI_PLANS_TOKEN_INVALID, tokenRejectedMessage],
                ['an expired token', tokenValidationError, ErrorEventCode.EMI_PLANS_TOKEN_INVALID, tokenRejectedMessage],
                [
                    'another API error',
                    () =>
                        apiError({
                            type: 'https://docs.adyen.com/errors/internal',
                            errorCode: '00_500',
                            title: 'Internal error',
                            status: 500
                        }),
                    ErrorEventCode.EMI_PLANS_FETCH_FAILED,
                    'EMI: /utility/v1/emi/plans (500): Internal error'
                ],
                [
                    'a network failure',
                    () =>
                        new AdyenCheckoutError('NETWORK_ERROR', 'Call failed', {
                            cause: new TypeError('Failed to fetch')
                        }),
                    ErrorEventCode.EMI_PLANS_FETCH_FAILED,
                    'EMI: /utility/v1/emi/plans: Failed to fetch'
                ],
                [
                    'a timeout',
                    () =>
                        new AdyenCheckoutError('NETWORK_ERROR', 'Call failed', {
                            cause: new DOMException('Timed out', 'TimeoutError')
                        }),
                    ErrorEventCode.EMI_PLANS_FETCH_FAILED,
                    'EMI: /utility/v1/emi/plans: Timed out'
                ]
            ])('should send one network error event for %s', async (_case, createError, code, message) => {
                mockedGetEmiPlans.mockRejectedValue(createError());
                const { emi, sendAnalytics } = createEmi();

                render(emi.render());

                await waitFor(() => expect(errorEvents(sendAnalytics)).toHaveLength(1));
                expect(errorEvents(sendAnalytics)[0]).toEqual(
                    expect.objectContaining({
                        component: TxVariants.emi,
                        errorType: ErrorEventType.network,
                        code,
                        message
                    })
                );
                expect(validationErrorEvents(sendAnalytics)).toHaveLength(0);
            });

            test('should forward the backend error title but never the token the backend echoes in a field value', async () => {
                const emiToken = emiPaymentMethodMock.configuration?.emiToken ?? '';
                mockedGetEmiPlans.mockRejectedValue(
                    apiError({
                        type: 'https://docs.adyen.com/errors/bad-request',
                        errorCode: '00_400',
                        title: 'Bad request',
                        detail: 'Size of string value is above allowed limit',
                        requestId: '0dc47c14a735c3d66997fbaf0cbe031c',
                        status: 400,
                        invalidFields: [{ name: 'emiToken', value: emiToken, message: 'Input value violates constraint value 1000' }]
                    })
                );
                const { emi, sendAnalytics } = createEmi();

                render(emi.render());

                await waitFor(() => expect(errorEvents(sendAnalytics)).toHaveLength(1));
                const payload = JSON.stringify(sendAnalytics.mock.calls.map(([event]) => event));
                expect(errorEvents(sendAnalytics)[0]).toEqual(
                    expect.objectContaining({
                        message: 'EMI: /utility/v1/emi/plans (400): Bad request'
                    })
                );
                expect(payload).not.toContain(emiToken);
            });
        });

        test('should carry no amount, and no data of the card the shopper is filling in', async () => {
            const { emi, sendAnalytics } = createEmi({
                amount: { value: 15499900, currency: 'INR' }
            });
            await renderWithPlans(emi);
            await user.click(screen.getByLabelText('Provider'));
            await user.click(
                within(screen.getAllByRole('listbox')[0]).getByRole('option', {
                    name: new RegExp(hdfc.issuerName, 'i')
                })
            );
            const payload = JSON.stringify(sendAnalytics.mock.calls.map(([event]) => event));
            expect(payload).not.toContain('5166633');
            expect(payload).not.toContain('INR');
            expect(payload).not.toContain('transactionAmounts');
            expect(payload).not.toContain('encryptedCardNumber');
        });
    });
});
