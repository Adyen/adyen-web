import base64 from './base64';
import { createSdkData } from './createSdkData';
import { CHANNEL, PLATFORM, PAYMENT_METHOD_BEHAVIOR, LIBRARY_VERSION } from '../core/config';

const TEST_CHECKOUT_ATTEMPT_ID = 'test-checkout-attempt-id';
const TEST_CLIENT_DATA = 'test-client-data';

const decodeSdkData = (input: string) => {
    const { data } = base64.decode(input);
    if (!data) {
        throw new Error(`Failed to decode base64 input`);
    }
    return JSON.parse(data);
};

describe('createSdkData', () => {
    test('should return a base64-encoded JSON string', () => {
        const result = createSdkData(TEST_CHECKOUT_ATTEMPT_ID, null, PAYMENT_METHOD_BEHAVIOR.NATIVE);
        expect(typeof result).toBe('string');
        expect(() => decodeSdkData(result)).not.toThrow();
    });

    test('should encode schemaVersion as 1', () => {
        const result = createSdkData(TEST_CHECKOUT_ATTEMPT_ID, null, PAYMENT_METHOD_BEHAVIOR.NATIVE);
        const decoded = decodeSdkData(result);
        expect(decoded.schemaVersion).toBe(1);
    });

    test('should encode channel as CHANNEL.WEB', () => {
        const result = createSdkData(TEST_CHECKOUT_ATTEMPT_ID, null, PAYMENT_METHOD_BEHAVIOR.NATIVE);
        const decoded = decodeSdkData(result);
        expect(decoded.channel).toBe(CHANNEL.WEB);
    });

    test('should encode platform as PLATFORM', () => {
        const result = createSdkData(TEST_CHECKOUT_ATTEMPT_ID, null, PAYMENT_METHOD_BEHAVIOR.NATIVE);
        const decoded = decodeSdkData(result);
        expect(decoded.platform).toBe(PLATFORM);
    });

    test('should encode sdkVersion from LIBRARY_VERSION', () => {
        const result = createSdkData(TEST_CHECKOUT_ATTEMPT_ID, null, PAYMENT_METHOD_BEHAVIOR.NATIVE);
        const decoded = decodeSdkData(result);
        expect(decoded.sdkVersion).toBe(LIBRARY_VERSION);
    });

    test('should encode checkoutAttemptId in the analytics field', () => {
        const result = createSdkData(TEST_CHECKOUT_ATTEMPT_ID, null, PAYMENT_METHOD_BEHAVIOR.NATIVE);
        const decoded = decodeSdkData(result);
        expect(decoded.analytics.checkoutAttemptId).toBe(TEST_CHECKOUT_ATTEMPT_ID);
    });

    test('should encode paymentMethodBehavior as NATIVE when PAYMENT_METHOD_BEHAVIOR.NATIVE is passed', () => {
        const result = createSdkData(TEST_CHECKOUT_ATTEMPT_ID, null, PAYMENT_METHOD_BEHAVIOR.NATIVE);
        const decoded = decodeSdkData(result);
        expect(decoded.paymentMethodBehavior).toBe(PAYMENT_METHOD_BEHAVIOR.NATIVE);
    });

    test('should encode paymentMethodBehavior as GENERIC when PAYMENT_METHOD_BEHAVIOR.GENERIC is passed', () => {
        const result = createSdkData(TEST_CHECKOUT_ATTEMPT_ID, null, PAYMENT_METHOD_BEHAVIOR.GENERIC);
        const decoded = decodeSdkData(result);
        expect(decoded.paymentMethodBehavior).toBe(PAYMENT_METHOD_BEHAVIOR.GENERIC);
    });

    test('should include riskData when clientData is provided', () => {
        const result = createSdkData(TEST_CHECKOUT_ATTEMPT_ID, TEST_CLIENT_DATA, PAYMENT_METHOD_BEHAVIOR.NATIVE);
        const decoded = decodeSdkData(result);
        expect(decoded.riskData).toEqual({ clientData: TEST_CLIENT_DATA });
    });

    test('should not include riskData when clientData is null', () => {
        const result = createSdkData(TEST_CHECKOUT_ATTEMPT_ID, null, PAYMENT_METHOD_BEHAVIOR.NATIVE);
        const decoded = decodeSdkData(result);
        expect(decoded.riskData).toBeUndefined();
    });
});
