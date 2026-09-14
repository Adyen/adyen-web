import type { UIElementProps } from '../internal/UIElement/types';

export interface KlarnaNetworkConfiguration extends UIElementProps {
    /**
     * Klarna partner account client id. The SDK derives playground vs production from its prefix,
     * so no environment configuration is needed.
     */
    clientId: string;

    partnerAccountId?: string;

    /** Passed to the SDK as `acquiringConfig.paymentAccountId`. */
    paymentAccountId?: string;
}
