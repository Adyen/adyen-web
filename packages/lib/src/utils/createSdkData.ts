import base64 from './base64';
import { LIBRARY_VERSION, CHANNEL, PLATFORM, PAYMENT_METHOD_BEHAVIOR } from '../core/config';
export interface SdkDataObject {
    schemaVersion: number;
    createdAt: number;
    channel: CHANNEL;
    platform: string;
    sdkVersion: string;
    paymentMethodBehavior: PAYMENT_METHOD_BEHAVIOR;
    analytics: {
        checkoutAttemptId: string;
    };
    riskData: {
        clientData: string;
    };
}

export interface CreateSdkDataParams {
    checkoutAttemptId: string;
    clientData: string | null;
    paymentMethodBehavior: PAYMENT_METHOD_BEHAVIOR;
    paymentMethodConfiguration?: {
        supportsPayPalV6?: boolean;
    };
}

/**
 * @param checkoutAttemptId - The checkout attempt ID from analytics
 * @param clientData - The client data from risk module
 * @param paymentMethodBehavior - The payment method behavior
 * @param supportsPayPalV6 - Whether PayPal SDK v6 is supported
 * @returns Base64 encoded JSON string of the SDK data object
 */
export function createSdkData({ checkoutAttemptId, clientData, paymentMethodBehavior, paymentMethodConfiguration }: CreateSdkDataParams): string {
    const sdkDataObject: SdkDataObject = {
        schemaVersion: 1,
        createdAt: Date.now(),
        channel: CHANNEL.WEB,
        platform: PLATFORM,
        sdkVersion: LIBRARY_VERSION,
        paymentMethodBehavior,
        analytics: {
            checkoutAttemptId
        },
        ...(clientData && { riskData: { clientData } }),
        ...(paymentMethodConfiguration && { paymentMethodConfiguration })
    };

    return base64.encode(JSON.stringify(sdkDataObject));
}
