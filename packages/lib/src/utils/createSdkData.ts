import base64 from './base64';
import { LIBRARY_VERSION, CHANNEL, PLATFORM, Channel, Platform, PaymentMethodBehavior } from '../core/config';
export interface SdkDataObject {
    schemaVersion: number;
    createdAt: number;
    channel: Channel;
    platform: Platform;
    sdkVersion: string;
    paymentMethodBehavior: PaymentMethodBehavior;
    analytics: {
        checkoutAttemptId: string;
    };
    riskData: {
        clientData: string;
    };
}

/**
 * Creates the sdkData object with analytics and risk information
 * @param checkoutAttemptId - The checkout attempt ID from analytics
 * @param clientData - The client data from risk module
 * @returns Base64 encoded JSON string of the SDK data object
 */
export function createSdkData(checkoutAttemptId: string, clientData: string | null, paymentMethodBehavior: PaymentMethodBehavior): string {
    const sdkDataObject: SdkDataObject = {
        schemaVersion: 1,
        createdAt: Date.now(),
        channel: CHANNEL.WEB,
        platform: PLATFORM.WEB,
        sdkVersion: LIBRARY_VERSION,
        paymentMethodBehavior,
        analytics: {
            checkoutAttemptId
        },
        ...(clientData && { riskData: { clientData } })
    };

    return base64.encode(JSON.stringify(sdkDataObject));
}
