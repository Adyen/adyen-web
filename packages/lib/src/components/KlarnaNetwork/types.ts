import type { ComponentMethodsRef, UIElementProps, UIElementStatus } from '../internal/UIElement/types';
import type { KlarnaButtonLogoAlignment, KlarnaButtonShape, KlarnaButtonTheme, KlarnaInitiationMode, KlarnaIntent } from './klarna-web-sdk-types';

/**
 * Which button drives the payment.
 * - 'klarna': the native button returned by the Klarna Web SDK presentation (Option 1).
 * - 'adyen': the standard Adyen PayButton (Option 2).
 *
 * A merchant-owned button (Option 3) is configured with `showPayButton: false` and by calling
 * `component.submit()` from the merchant's own click handler.
 */
export type KlarnaPayButtonVariant = 'klarna' | 'adyen';

export interface KlarnaNetworkButtonStyle {
    theme?: KlarnaButtonTheme;
    shape?: KlarnaButtonShape;
    logoAlignment?: KlarnaButtonLogoAlignment;
    initiationMode?: KlarnaInitiationMode;
}

export interface KlarnaNetworkConfiguration extends UIElementProps {
    /**
     * Klarna partner account client id. The SDK derives playground vs production from its prefix,
     * so no environment configuration is needed.
     */
    clientId?: string;

    partnerAccountId?: string;

    /** Passed to the SDK as `acquiringConfig.paymentAccountId`. */
    paymentAccountId?: string;

    /**
     * Klarna Network Session Token.
     *
     * POC limitation: there is no server-side token exchange, so the token is a plain config prop.
     */
    klarnaNetworkSessionToken?: string;

    /**
     * Sends the `klarnaNetworkSessionToken` and `paymentOptionId` captured from the Klarna SDK as
     * part of the `/payments` payment method.
     *
     * On by default, because it is the intended Klarna Network contract. `KlarnaDetails` does not
     * know these fields yet, so /payments currently answers
     * `400 errorCode 702 - Structure of KlarnaDetails contains the following unknown fields`.
     * Turn it off to drop them while debugging. The captured values are logged either way.
     *
     * @defaultValue true
     */
    sendKlarnaNetworkData?: boolean;

    /**
     * @defaultValue 'PAY'
     */
    intent?: KlarnaIntent;

    /**
     * @defaultValue 'klarna'
     */
    payButtonVariant?: KlarnaPayButtonVariant;

    /** Styling of the native Klarna pay button. Ignored when `payButtonVariant` is 'adyen'. */
    klarnaButtonStyle?: KlarnaNetworkButtonStyle;

    /**
     * Overrides the Klarna Web SDK module URL. Test-only escape hatch.
     * @internal
     */
    sdkUrl?: string;
}

export interface KlarnaNetworkComponentRef extends ComponentMethodsRef {
    setStatus(status: UIElementStatus): void;

    /** Refetches the Klarna presentation, e.g. after Drop-in re-selects the payment method. */
    refreshPresentation(): void;

    /**
     * Starts the Klarna journey for a button Adyen owns. Must run synchronously inside the click
     * handler, otherwise popup blockers close the Klarna window.
     */
    initiatePayment(): void;
}
