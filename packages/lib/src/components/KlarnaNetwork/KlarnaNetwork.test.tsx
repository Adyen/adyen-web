import { render, screen, waitFor } from '@testing-library/preact';
import KlarnaNetwork from './KlarnaNetwork';
import { setupCoreMock } from '../../../config/testMocks/setup-core-mock';
import { loadKlarnaWebSdk } from './utils/load-klarna-web-sdk';
import { clearKlarnaSdkInstanceCache } from './utils/get-klarna-sdk-instance';
import { getPaymentRequestUrl } from './utils/get-payment-request-url';

import type { KlarnaNetworkConfiguration } from './types';
import type {
    Klarna,
    KlarnaPaymentButton,
    KlarnaPaymentButtonConfig,
    KlarnaPaymentEvent,
    KlarnaPaymentEventHandler,
    KlarnaPaymentOption,
    KlarnaUIElement,
    PaymentPresentation
} from './klarna-web-sdk-types';

jest.mock('./utils/load-klarna-web-sdk');

const loadKlarnaWebSdkMock = loadKlarnaWebSdk as jest.MockedFunction<typeof loadKlarnaWebSdk>;

type MockedUIElement = KlarnaUIElement & { mount: jest.Mock; unmount: jest.Mock };
type MockedPaymentButton = KlarnaPaymentButton & { mount: jest.Mock; unmount: jest.Mock; toggleState: jest.Mock };

function createUIElement(): MockedUIElement {
    const element: MockedUIElement = {
        htmlElement: document.createElement('div'),
        mount: jest.fn(() => element),
        unmount: jest.fn(() => element)
    };
    return element;
}

function createPaymentButton(): MockedPaymentButton {
    const button: MockedPaymentButton = {
        htmlElement: document.createElement('button'),
        mount: jest.fn(() => button),
        unmount: jest.fn(() => button),
        toggleState: jest.fn(() => button)
    };
    return button;
}

function createPaymentOption(paymentOptionId: string) {
    const message = createUIElement();
    const button = createPaymentButton();
    const buttonComponent = jest.fn((_config: KlarnaPaymentButtonConfig) => button);

    const option: KlarnaPaymentOption = {
        paymentOptionId,
        icon: { component: jest.fn(createUIElement) },
        header: { component: jest.fn(createUIElement) },
        subheader: { component: jest.fn(createUIElement) },
        message: { component: jest.fn(() => message) },
        paymentButton: { component: buttonComponent }
    };

    return { option, message, button, buttonComponent };
}

function createPresentation(overrides: Partial<PaymentPresentation> = {}): PaymentPresentation {
    return {
        instruction: 'SHOW_KLARNA',
        paymentStatus: 'REQUIRES_CUSTOMER_ACTION',
        ...overrides
    };
}

function createKlarnaSdk(presentation?: PaymentPresentation) {
    const registeredHandlers: Array<[KlarnaPaymentEvent, KlarnaPaymentEventHandler]> = [];

    const payment = {
        presentation: jest.fn().mockResolvedValue(presentation),
        initiate: jest.fn().mockResolvedValue(undefined),
        on: jest.fn((event: KlarnaPaymentEvent, handler: KlarnaPaymentEventHandler) => {
            registeredHandlers.push([event, handler]);
        }),
        off: jest.fn()
    };

    const klarna = { Payment: payment } as unknown as Klarna;
    const factory = jest.fn().mockResolvedValue(klarna);

    loadKlarnaWebSdkMock.mockResolvedValue(factory);

    return { klarna, payment, factory, registeredHandlers };
}

const core = setupCoreMock();

const BASE_PROPS: KlarnaNetworkConfiguration = {
    name: 'Klarna',
    i18n: core.modules.i18n,
    loadingContext: 'test',
    modules: { resources: core.modules.resources, analytics: core.modules.analytics },
    amount: { value: 1000, currency: 'EUR' },
    clientId: 'klarna_test_client_id',
    paymentAccountId: 'krn:payment:account:test:123',
    partnerAccountId: 'krn:partner:global:account:test:123',
    sdkUrl: 'https://example.test/klarna.mjs'
};

function renderKlarnaNetwork(props: KlarnaNetworkConfiguration = {}) {
    const element = new KlarnaNetwork(core, { ...BASE_PROPS, ...props });
    const view = render(element.render());
    return { element, view };
}

describe('KlarnaNetwork', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        clearKlarnaSdkInstanceCache();
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('is always valid and falls back to the Klarna display name and logo', () => {
        createKlarnaSdk(createPresentation({ paymentOption: createPaymentOption('option-1').option }));

        const { element } = renderKlarnaNetwork({ name: undefined });

        expect(element.isValid).toBe(true);
        expect(element.displayName).toBe('Klarna');

        // 'klarna_network' has no icon asset of its own, so the regular Klarna logo is served.
        jest.mocked(core.modules.resources.getImage).mockImplementationOnce(() => (name: string) => `${name}_ICON`);
        expect(element.icon).toBe('klarna_ICON');
    });

    test('a configured name wins over the Klarna fallback', () => {
        createKlarnaSdk(createPresentation({ paymentOption: createPaymentOption('option-1').option }));

        const { element } = renderKlarnaNetwork({ name: 'Klarna - Pay in 3' });

        expect(element.displayName).toBe('Klarna - Pay in 3');
    });

    test('initialises the SDK with the acquiring configuration and fetches the presentation for the amount', async () => {
        const { option } = createPaymentOption('option-1');
        const { factory, payment } = createKlarnaSdk(createPresentation({ paymentOption: option }));

        renderKlarnaNetwork();

        await screen.findByTestId('klarna-network');

        expect(loadKlarnaWebSdkMock).toHaveBeenCalledWith('https://example.test/klarna.mjs');
        expect(factory).toHaveBeenCalledWith({
            clientId: 'klarna_test_client_id',
            products: ['PAYMENT'],
            partnerAccountId: 'krn:partner:global:account:test:123',
            acquiringConfig: { paymentAccountId: 'krn:payment:account:test:123' },
            klarnaNetworkSessionToken: undefined,
            locale: 'en-US'
        });
        expect(payment.presentation).toHaveBeenCalledWith({
            amount: 1000,
            currency: 'EUR',
            locale: 'en-US',
            intent: 'PAY'
        });
    });

    test('mounts the Klarna message component into the message container', async () => {
        const { option, message } = createPaymentOption('option-1');
        createKlarnaSdk(createPresentation({ paymentOption: option }));

        renderKlarnaNetwork();

        const container = await screen.findByTestId('klarna-network-message');
        await waitFor(() => expect(message.mount).toHaveBeenCalledWith(container));
    });

    test('registers the Klarna event handlers before mounting the button', async () => {
        const { option, button } = createPaymentOption('option-1');
        const { payment } = createKlarnaSdk(createPresentation({ paymentOption: option }));

        renderKlarnaNetwork();

        await waitFor(() => expect(button.mount).toHaveBeenCalled());

        expect(payment.on.mock.calls.map(([event]) => event)).toEqual(['complete', 'abort', 'error']);
        expect(payment.on.mock.invocationCallOrder[0]).toBeLessThan(button.mount.mock.invocationCallOrder[0]);
    });

    describe('pay button variants', () => {
        test("payButtonVariant 'klarna' mounts the native SDK button with the configured style", async () => {
            const { option, button, buttonComponent } = createPaymentOption('option-1');
            createKlarnaSdk(createPresentation({ paymentOption: option }));

            renderKlarnaNetwork({
                payButtonVariant: 'klarna',
                klarnaButtonStyle: { theme: 'dark', shape: 'pill', logoAlignment: 'center', initiationMode: 'POPUP' }
            });

            const container = await screen.findByTestId('klarna-network-button');
            await waitFor(() => expect(button.mount).toHaveBeenCalledWith(container));

            expect(buttonComponent).toHaveBeenCalledWith(
                expect.objectContaining({
                    theme: 'dark',
                    shape: 'pill',
                    logoAlignment: 'center',
                    initiationMode: 'POPUP',
                    intent: 'PAY',
                    initiate: expect.any(Function)
                })
            );
            expect(screen.queryByRole('button')).toBeNull();
        });

        test('omits the style keys Klarna was not configured with', async () => {
            const { option, button, buttonComponent } = createPaymentOption('option-1');
            createKlarnaSdk(createPresentation({ paymentOption: option }));

            renderKlarnaNetwork({ klarnaButtonStyle: { theme: 'dark' } });

            await waitFor(() => expect(button.mount).toHaveBeenCalled());

            // Klarna reflects config values onto data attributes verbatim, so an undefined key would
            // end up as data-shape="undefined".
            expect(Object.keys(buttonComponent.mock.calls[0][0]).sort()).toEqual(['initiate', 'intent', 'theme']);
        });

        test("payButtonVariant 'adyen' renders the Adyen PayButton and no native button", async () => {
            const { option, button } = createPaymentOption('option-1');
            createKlarnaSdk(createPresentation({ paymentOption: option }));

            renderKlarnaNetwork({ payButtonVariant: 'adyen' });

            expect(await screen.findByRole('button')).toBeTruthy();
            expect(screen.queryByTestId('klarna-network-button')).toBeNull();
            expect(button.mount).not.toHaveBeenCalled();
        });

        test('showPayButton false renders neither button', async () => {
            const { option, button } = createPaymentOption('option-1');
            createKlarnaSdk(createPresentation({ paymentOption: option }));

            renderKlarnaNetwork({ showPayButton: false });

            await screen.findByTestId('klarna-network');

            expect(screen.queryByTestId('klarna-network-button')).toBeNull();
            expect(screen.queryByRole('button')).toBeNull();
            expect(button.mount).not.toHaveBeenCalled();
        });
    });

    describe("Klarna's built-in fallback presentation", () => {
        test('warns when the payment option id is one Klarna hardcodes into its fallback', async () => {
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
            const { option } = createPaymentOption('KLARNA');
            createKlarnaSdk(createPresentation({ paymentOption: option }));

            renderKlarnaNetwork();

            await screen.findByTestId('klarna-network');
            expect(warn).toHaveBeenCalledWith(expect.stringContaining('built-in fallback presentation'));

            warn.mockRestore();
        });

        test('stays quiet for a genuine payment option id', async () => {
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
            createKlarnaSdk(createPresentation({ paymentOption: createPaymentOption('option-1').option }));

            renderKlarnaNetwork();

            await screen.findByTestId('klarna-network');
            expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('built-in fallback presentation'));

            warn.mockRestore();
        });
    });

    test('renders nothing when Klarna instructs to hide', async () => {
        const { option } = createPaymentOption('option-1');
        const { payment } = createKlarnaSdk(createPresentation({ instruction: 'HIDE_KLARNA', paymentOption: option }));

        renderKlarnaNetwork();

        await waitFor(() => expect(payment.presentation).toHaveBeenCalled());
        await waitFor(() => expect(screen.queryByTestId('spinner')).toBeNull());

        expect(screen.queryByTestId('klarna-network')).toBeNull();
    });

    test('prefers the saved payment option over the generic one', async () => {
        const saved = createPaymentOption('saved-option');
        const generic = createPaymentOption('generic-option');
        createKlarnaSdk(createPresentation({ paymentOption: generic.option, savedPaymentOption: saved.option }));

        renderKlarnaNetwork();

        await waitFor(() => expect(saved.button.mount).toHaveBeenCalled());
        expect(generic.button.mount).not.toHaveBeenCalled();
    });

    describe('authorization', () => {
        const captureInitiate = async (buttonComponent: jest.Mock) => {
            await waitFor(() => expect(buttonComponent).toHaveBeenCalled());
            const { initiate } = buttonComponent.mock.calls[0][0] as KlarnaPaymentButtonConfig;
            if (!initiate) throw new Error('The Klarna pay button was created without an initiate callback');
            return initiate;
        };

        test('returns the redirect action URL as paymentRequestUrl and submits the captured Klarna data', async () => {
            const { option, buttonComponent } = createPaymentOption('option-1');
            createKlarnaSdk(createPresentation({ paymentOption: option }));

            const onSubmit = jest.fn((_state, _element, actions) => {
                actions.resolve({
                    resultCode: 'Pending',
                    action: {
                        type: 'redirect',
                        method: 'GET',
                        paymentMethodType: 'klarna',
                        url: 'https://payment-request.klarna.test/abc'
                    }
                });
            });

            const { element } = renderKlarnaNetwork({ onSubmit });
            const initiate = await captureInitiate(buttonComponent);

            await expect(initiate({ klarnaNetworkSessionToken: 'kn-token', paymentOptionId: 'option-1' })).resolves.toEqual({
                paymentRequestUrl: 'https://payment-request.klarna.test/abc'
            });

            expect(onSubmit).toHaveBeenCalled();
            // The intended Klarna Network contract, which today's /payments rejects.
            expect(element.data.paymentMethod).toEqual(
                expect.objectContaining({
                    type: 'klarna_network',
                    klarnaNetworkSessionToken: 'kn-token',
                    paymentOptionId: 'option-1'
                })
            );
            // 'sdk' would make /payments answer with the classic Klarna widget action instead.
            expect(element.data.paymentMethod).not.toHaveProperty('subtype');
        });

        test('drops the Klarna Network fields when sendKlarnaNetworkData is turned off', async () => {
            const { option, buttonComponent } = createPaymentOption('option-1');
            createKlarnaSdk(createPresentation({ paymentOption: option }));

            const onSubmit = jest.fn((_state, _element, actions) => actions.resolve({ resultCode: 'Authorised' }));

            const { element } = renderKlarnaNetwork({ onSubmit, sendKlarnaNetworkData: false });
            const initiate = await captureInitiate(buttonComponent);

            await initiate({ klarnaNetworkSessionToken: 'kn-token', paymentOptionId: 'option-1' });

            // /payments answers 400 errorCode 702 for either field today.
            expect(element.data.paymentMethod).not.toHaveProperty('klarnaNetworkSessionToken');
            expect(element.data.paymentMethod).not.toHaveProperty('paymentOptionId');
        });

        test('routes a plain resultCode through the regular response handling', async () => {
            const { option, buttonComponent } = createPaymentOption('option-1');
            createKlarnaSdk(createPresentation({ paymentOption: option }));

            const onPaymentCompleted = jest.fn();
            const onSubmit = jest.fn((_state, _element, actions) => actions.resolve({ resultCode: 'Authorised' }));

            renderKlarnaNetwork({ onSubmit, onPaymentCompleted });
            const initiate = await captureInitiate(buttonComponent);

            await expect(initiate({ klarnaNetworkSessionToken: 'kn-token', paymentOptionId: 'option-1' })).resolves.toEqual({});

            await waitFor(() =>
                expect(onPaymentCompleted).toHaveBeenCalledWith(expect.objectContaining({ resultCode: 'Authorised' }), expect.anything())
            );
        });

        test('falls back to the presentation payment option id when Klarna does not provide one', async () => {
            const { option, buttonComponent } = createPaymentOption('presented-option');
            createKlarnaSdk(createPresentation({ paymentOption: option }));

            const onSubmit = jest.fn((_state, _element, actions) => actions.resolve({ resultCode: 'Authorised' }));

            const { element } = renderKlarnaNetwork({ onSubmit, sendKlarnaNetworkData: true });
            const initiate = await captureInitiate(buttonComponent);

            await initiate({ klarnaNetworkSessionToken: 'kn-token' });

            expect(element.data.paymentMethod).toEqual(expect.objectContaining({ paymentOptionId: 'presented-option' }));
        });
    });

    test('submit() delegates to klarna.Payment.initiate for the Adyen pay button', async () => {
        const { option } = createPaymentOption('option-1');
        const { payment } = createKlarnaSdk(createPresentation({ paymentOption: option }));

        const { element } = renderKlarnaNetwork({ payButtonVariant: 'adyen' });

        await screen.findByRole('button');

        element.submit();

        expect(payment.initiate).toHaveBeenCalledWith(expect.any(Function), { initiationMode: 'DEVICE_BEST' });
    });

    test('submit() reports an implementation error while the native Klarna button is shown', async () => {
        const { option } = createPaymentOption('option-1');
        const { payment } = createKlarnaSdk(createPresentation({ paymentOption: option }));

        const onError = jest.fn();
        const { element } = renderKlarnaNetwork({ onError });

        await screen.findByTestId('klarna-network');

        element.submit();

        expect(onError).toHaveBeenCalledWith(expect.objectContaining({ name: 'IMPLEMENTATION_ERROR' }), expect.anything());
        expect(payment.initiate).not.toHaveBeenCalled();
    });

    test('unmounting removes the Klarna UI elements and the event handlers', async () => {
        const { option, message, button } = createPaymentOption('option-1');
        const { payment, registeredHandlers } = createKlarnaSdk(createPresentation({ paymentOption: option }));

        const { view } = renderKlarnaNetwork();

        await waitFor(() => expect(button.mount).toHaveBeenCalled());

        view.unmount();

        expect(message.unmount).toHaveBeenCalled();
        expect(button.unmount).toHaveBeenCalled();
        expect(payment.off).toHaveBeenCalledTimes(registeredHandlers.length);
        registeredHandlers.forEach(([event, handler]) => expect(payment.off).toHaveBeenCalledWith(event, handler));
    });

    test('reports an implementation error when the clientId is missing', async () => {
        createKlarnaSdk(createPresentation({ paymentOption: createPaymentOption('option-1').option }));

        const onError = jest.fn();
        renderKlarnaNetwork({ clientId: '', onError });

        await waitFor(() => expect(onError).toHaveBeenCalledWith(expect.objectContaining({ name: 'IMPLEMENTATION_ERROR' }), expect.anything()));
        expect(loadKlarnaWebSdkMock).not.toHaveBeenCalled();
    });

    test('omits the acquiring config when no paymentAccountId is configured', async () => {
        const { factory } = createKlarnaSdk(createPresentation({ paymentOption: createPaymentOption('option-1').option }));

        renderKlarnaNetwork({ paymentAccountId: '' });

        await waitFor(() => expect(factory).toHaveBeenCalled());
        expect(factory).toHaveBeenCalledWith(expect.not.objectContaining({ acquiringConfig: expect.anything() }));
    });
});

describe('getPaymentRequestUrl', () => {
    test('returns the URL of a redirect action', () => {
        expect(
            getPaymentRequestUrl({
                resultCode: 'Pending',
                action: { type: 'redirect', method: 'GET', paymentMethodType: 'klarna', url: 'https://klarna.test/pr' }
            })
        ).toBe('https://klarna.test/pr');
    });

    test('returns undefined for any other action or for no action at all', () => {
        expect(getPaymentRequestUrl({ resultCode: 'Authorised' })).toBeUndefined();
        expect(getPaymentRequestUrl(undefined)).toBeUndefined();
        expect(
            getPaymentRequestUrl({
                resultCode: 'Pending',
                action: { type: 'sdk', paymentMethodType: 'klarna', url: 'https://klarna.test/pr' }
            })
        ).toBeUndefined();
    });
});
