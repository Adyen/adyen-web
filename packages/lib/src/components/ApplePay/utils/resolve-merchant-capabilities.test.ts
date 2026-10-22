import { resolveMerchantCapabilities } from './resolve-merchant-capabilities';

describe('resolveMerchantCapabilities()', () => {
    test('should add supportsEMV when chinaUnionPay is a supported network', () => {
        expect(resolveMerchantCapabilities(['supports3DS'], ['visa', 'chinaUnionPay'])).toStrictEqual(['supports3DS', 'supportsEMV']);
    });

    test('should not add supportsEMV twice', () => {
        expect(resolveMerchantCapabilities(['supports3DS', 'supportsEMV'], ['chinaUnionPay'])).toStrictEqual(['supports3DS', 'supportsEMV']);
    });

    test('should keep the merchant capabilities when adding supportsEMV', () => {
        expect(resolveMerchantCapabilities(['supports3DS', 'supportsDebit'], ['chinaUnionPay'])).toStrictEqual([
            'supports3DS',
            'supportsDebit',
            'supportsEMV'
        ]);
    });

    test('should return the capabilities unchanged when chinaUnionPay is not a supported network', () => {
        const capabilities: ApplePayJS.ApplePayMerchantCapability[] = ['supports3DS'];
        expect(resolveMerchantCapabilities(capabilities, ['visa', 'masterCard'])).toBe(capabilities);
    });

    test('should handle missing capabilities and networks', () => {
        expect(resolveMerchantCapabilities(undefined, undefined)).toBeUndefined();
        expect(resolveMerchantCapabilities(undefined, ['chinaUnionPay'])).toStrictEqual(['supportsEMV']);
    });
});
