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
    paymentMethodConfiguration?: PaymentMethodConfiguration;
}

export interface PaymentMethodConfiguration {
    supportsPayPalV6?: boolean;
}

export interface CreateSdkDataParams {
    checkoutAttemptId: string;
    clientData: string | null;
    paymentMethodBehavior: PAYMENT_METHOD_BEHAVIOR;
    paymentMethodConfiguration?: PaymentMethodConfiguration;
}

/**
 * @param params - The parameters for creating the SDK data
 * @param params.checkoutAttemptId - The checkout attempt ID from analytics
 * @param params.clientData - The client data from risk module
 * @param params.paymentMethodBehavior - The payment method behavior
 * @param params.paymentMethodConfiguration - The payment method configuration
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
