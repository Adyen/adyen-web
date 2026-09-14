import { h } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import Spinner from '../../../internal/Spinner';
import AdyenCheckoutError from '../../../../core/Errors/AdyenCheckoutError';
import useAnalytics from '../../../../core/Analytics/useAnalytics';
import { AnalyticsInfoEvent, InfoEventType } from '../../../../core/Analytics/events/AnalyticsInfoEvent';
import { AnalyticsErrorEvent, ErrorEventType } from '../../../../core/Analytics/events/AnalyticsErrorEvent';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { useAmount } from '../../../../core/Context/AmountProvider';
import { getKlarnaSdkInstance } from '../../utils/get-klarna-sdk-instance';
import { ERRORS, ERROR_CODES, KLARNA_BUTTON_CONTAINER_ID, KLARNA_FALLBACK_PAYMENT_OPTION_IDS, KLARNA_MESSAGE_CONTAINER_ID } from '../../constants';
import { TxVariants } from '../../../tx-variants';
import './KlarnaNetworkContainer.scss';

import type { UIElementStatus } from '../../../internal/UIElement/types';
import type { PayButtonProps } from '../../../internal/PayButton/PayButton';
import type { KlarnaNetworkButtonStyle, KlarnaNetworkComponentRef, KlarnaPayButtonVariant } from '../../types';
import type {
    Klarna,
    KlarnaInitiateCallback,
    KlarnaIntent,
    KlarnaPaymentButton,
    KlarnaPaymentEvent,
    KlarnaPaymentEventHandler,
    KlarnaPaymentOption,
    KlarnaUIElement
} from '../../klarna-web-sdk-types';

export interface KlarnaNetworkContainerProps {
    setComponentRef(ref: KlarnaNetworkComponentRef): void;
    onAuthorize: KlarnaInitiateCallback;
    onError(error: AdyenCheckoutError): void;
    onKlarnaComplete(paymentRequest: unknown): void;
    onKlarnaAbort(paymentRequest: unknown): void;
    payButton(props: PayButtonProps): h.JSX.Element;

    showPayButton?: boolean;
    payButtonVariant?: KlarnaPayButtonVariant;
    clientId?: string;
    partnerAccountId?: string;
    paymentAccountId?: string;
    klarnaNetworkSessionToken?: string;
    intent?: KlarnaIntent;
    klarnaButtonStyle?: KlarnaNetworkButtonStyle;
    sdkUrl?: string;
}

/** Whether the Klarna widgets are being loaded, can be displayed, or must not be displayed at all. */
type ViewState = 'loading' | 'ready' | 'hidden';

export function KlarnaNetworkContainer({
    setComponentRef,
    onAuthorize,
    onError,
    onKlarnaComplete,
    onKlarnaAbort,
    payButton,
    showPayButton = true,
    payButtonVariant = 'klarna',
    clientId,
    partnerAccountId,
    paymentAccountId,
    klarnaNetworkSessionToken,
    intent,
    klarnaButtonStyle,
    sdkUrl
}: Readonly<KlarnaNetworkContainerProps>) {
    const { i18n } = useCoreContext();
    const { analytics } = useAnalytics();
    const { amount } = useAmount();

    const [viewState, setViewState] = useState<ViewState>('loading');
    const [status, setStatus] = useState<UIElementStatus>('ready');
    const [paymentOption, setPaymentOption] = useState<KlarnaPaymentOption | null>(null);
    const [refreshCount, setRefreshCount] = useState(0);

    const messageContainerRef = useRef<HTMLDivElement>(null);
    const buttonContainerRef = useRef<HTMLDivElement>(null);
    const klarnaRef = useRef<Klarna | null>(null);
    const klarnaButtonRef = useRef<KlarnaPaymentButton | null>(null);

    /**
     * Mirrors the resolved payment option id so that the initiate callback keeps a stable identity
     * and never remounts the Klarna button.
     */
    const paymentOptionIdRef = useRef<string | undefined>(undefined);

    const showKlarnaButton = showPayButton && payButtonVariant === 'klarna';
    const showAdyenButton = showPayButton && payButtonVariant === 'adyen';
    const initiationMode = klarnaButtonStyle?.initiationMode;

    const handleInitiate = useCallback<KlarnaInitiateCallback>(
        params => onAuthorize({ ...params, paymentOptionId: params.paymentOptionId ?? paymentOptionIdRef.current }),
        [onAuthorize]
    );

    const refreshPresentation = useCallback(() => setRefreshCount(count => count + 1), []);

    const initiatePayment = useCallback(() => {
        const payment = klarnaRef.current?.Payment;

        if (!payment) {
            onError(new AdyenCheckoutError('ERROR', ERRORS.SDK_NOT_READY));
            return;
        }

        // Not awaited on purpose: the outcome is reported through the 'complete', 'abort' and
        // 'error' handlers registered below.
        void payment.initiate(handleInitiate, { initiationMode }).catch((error: unknown) => {
            onError(new AdyenCheckoutError('ERROR', ERRORS.AUTHORIZATION_FAILED, { cause: error }));
        });
    }, [handleInitiate, initiationMode, onError]);

    useEffect(() => {
        setComponentRef({ setStatus, refreshPresentation, initiatePayment });
    }, [setComponentRef, refreshPresentation, initiatePayment]);

    /** Loads the SDK, registers the Klarna event handlers and resolves the presentation. */
    useEffect(() => {
        if (!clientId) {
            onError(new AdyenCheckoutError('IMPLEMENTATION_ERROR', ERRORS.MISSING_CLIENT_ID));
            setViewState('hidden');
            return;
        }

        if (!amount?.currency) {
            onError(new AdyenCheckoutError('IMPLEMENTATION_ERROR', ERRORS.MISSING_AMOUNT));
            setViewState('hidden');
            return;
        }

        let isActive = true;
        const registeredHandlers: Array<[KlarnaPaymentEvent, KlarnaPaymentEventHandler]> = [];

        analytics.sendAnalytics(
            new AnalyticsInfoEvent({ type: InfoEventType.sdkDownloadInitiated, component: TxVariants.klarna_network, cdnUrl: sdkUrl })
        );

        const reportFailure = (code: string, message: string, error: unknown) => {
            analytics.sendAnalytics(
                new AnalyticsErrorEvent({ component: TxVariants.klarna_network, errorType: ErrorEventType.thirdParty, code, message })
            );
            onError(new AdyenCheckoutError('ERROR', message, { cause: error }));
            setViewState('hidden');
        };

        const setUpKlarna = async () => {
            const klarna = await getKlarnaSdkInstance(
                {
                    clientId,
                    products: ['PAYMENT'],
                    partnerAccountId,
                    // Klarna rejects an acquiring config that carries no account id.
                    ...(paymentAccountId && { acquiringConfig: { paymentAccountId } }),
                    klarnaNetworkSessionToken,
                    locale: i18n.locale
                },
                sdkUrl
            );

            if (!isActive) return;

            klarnaRef.current = klarna;
            analytics.sendAnalytics(
                new AnalyticsInfoEvent({ type: InfoEventType.sdkDownloadCompleted, component: TxVariants.klarna_network, cdnUrl: sdkUrl })
            );

            // Klarna requires the event handlers to be registered before the pay button is mounted.
            const handlers: Array<[KlarnaPaymentEvent, KlarnaPaymentEventHandler]> = [
                ['complete', paymentRequest => onKlarnaComplete(paymentRequest)],
                ['abort', paymentRequest => onKlarnaAbort(paymentRequest)],
                ['error', error => onError(new AdyenCheckoutError('ERROR', ERRORS.AUTHORIZATION_FAILED, { cause: error }))]
            ];
            handlers.forEach(([event, handler]) => {
                klarna.Payment.on(event, handler);
                registeredHandlers.push([event, handler]);
            });

            const presentation = await klarna.Payment.presentation({
                amount: amount.value,
                currency: amount.currency,
                locale: i18n.locale,
                intent
            });

            if (!isActive) return;

            if (!presentation || presentation.instruction === 'HIDE_KLARNA') {
                setViewState('hidden');
                return;
            }

            if (presentation.instruction !== 'SHOW_KLARNA') {
                console.warn(
                    `KlarnaNetwork: Drop-in cannot honour the '${presentation.instruction}' instruction yet, Klarna is rendered as a regular payment method row.`
                );
            }

            // A saved payment option takes priority over the generic one.
            const option = presentation.savedPaymentOption ?? presentation.paymentOption;

            if (!option) {
                setViewState('hidden');
                return;
            }

            if (KLARNA_FALLBACK_PAYMENT_OPTION_IDS.includes(option.paymentOptionId)) {
                console.warn(
                    `KlarnaNetwork: Klarna served its built-in fallback presentation ('${option.paymentOptionId}'), which means its presentation API answered ` +
                        '401 PERMISSION_DENIED on /cma/v4/messaging/presentation. Nothing below is backed by a real Klarna session. ' +
                        'This is an account or allowlisting problem rather than an integration one: Klarna must register the serving domain against the ' +
                        'clientId and grant it access to the presentation API.'
                );
            }

            paymentOptionIdRef.current = option.paymentOptionId;
            setPaymentOption(option);
            setViewState('ready');
        };

        void setUpKlarna().catch((error: unknown) => {
            if (!isActive) return;
            const hasSdk = klarnaRef.current !== null;
            reportFailure(
                hasSdk ? ERROR_CODES.PRESENTATION_FAILED : ERROR_CODES.SDK_LOAD_FAILED,
                hasSdk ? ERRORS.PRESENTATION_FAILED : ERRORS.SDK_LOAD_FAILED,
                error
            );
        });

        return () => {
            isActive = false;
            registeredHandlers.forEach(([event, handler]) => klarnaRef.current?.Payment.off(event, handler));
        };
        // The callbacks, the analytics module and i18n are stable for the lifetime of the element, so
        // only the values Klarna's presentation output depends on are listed as dependencies.
    }, [clientId, partnerAccountId, paymentAccountId, klarnaNetworkSessionToken, intent, sdkUrl, amount?.value, amount?.currency, refreshCount]);

    /** Mounts the Klarna UI elements once their containers are in the DOM. */
    useEffect(() => {
        if (viewState !== 'ready' || !paymentOption) return;

        const mountedElements: KlarnaUIElement[] = [];

        // Only the message is mounted: Adyen owns the accordion header, the logo and the subheader.
        if (paymentOption.message && messageContainerRef.current) {
            mountedElements.push(paymentOption.message.component().mount(messageContainerRef.current));
        }

        if (showKlarnaButton && buttonContainerRef.current) {
            // Klarna reflects every config value onto a data attribute verbatim, so undefined keys
            // are omitted rather than rendered as data-logo-alignment="undefined".
            const button = paymentOption.paymentButton.component({
                ...(klarnaButtonStyle?.theme && { theme: klarnaButtonStyle.theme }),
                ...(klarnaButtonStyle?.shape && { shape: klarnaButtonStyle.shape }),
                ...(klarnaButtonStyle?.logoAlignment && { logoAlignment: klarnaButtonStyle.logoAlignment }),
                ...(initiationMode && { initiationMode }),
                ...(intent && { intent }),
                initiate: handleInitiate
            });

            klarnaButtonRef.current = button;
            mountedElements.push(button.mount(buttonContainerRef.current));
        }

        return () => {
            mountedElements.forEach(element => element.unmount());
            klarnaButtonRef.current = null;
        };
    }, [
        viewState,
        paymentOption,
        showKlarnaButton,
        klarnaButtonStyle?.theme,
        klarnaButtonStyle?.shape,
        klarnaButtonStyle?.logoAlignment,
        initiationMode,
        intent,
        handleInitiate
    ]);

    useEffect(() => {
        const button = klarnaButtonRef.current;
        if (!button) return;

        const isBusy = status === 'loading';
        button.toggleState('loading', isBusy);
        button.toggleState('disabled', isBusy);
    }, [status]);

    if (viewState === 'hidden') return null;

    if (viewState === 'loading') {
        return (
            <div className="adyen-checkout__klarna-network" aria-live="polite" aria-busy="true">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="adyen-checkout__klarna-network" data-testid="klarna-network">
            <div
                className="adyen-checkout__klarna-network__message"
                id={KLARNA_MESSAGE_CONTAINER_ID}
                ref={messageContainerRef}
                data-testid="klarna-network-message"
            />

            {showKlarnaButton && (
                <div
                    className="adyen-checkout__klarna-network__button"
                    id={KLARNA_BUTTON_CONTAINER_ID}
                    ref={buttonContainerRef}
                    data-testid="klarna-network-button"
                />
            )}

            {showAdyenButton && payButton({ status, disabled: status !== 'ready' })}
        </div>
    );
}

export default KlarnaNetworkContainer;
