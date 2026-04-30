import base64 from './base64';

export interface SdkDataObject {
    schemaVersion: number;
    createdAt: number;
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
export function createSdkData(checkoutAttemptId: string, clientData: string | null): string {
    const sdkDataObject: SdkDataObject = {
        schemaVersion: 1,
        createdAt: Date.now(),
        analytics: {
            checkoutAttemptId
        },
        ...(clientData && { riskData: { clientData } })
    };

    return base64.encode(JSON.stringify(sdkDataObject));
}
