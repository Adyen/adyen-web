import { CHINA_UNION_PAY_NETWORK } from './map-adyen-brands-to-applepay-brands';

const EMV_CAPABILITY: ApplePayJS.ApplePayMerchantCapability = 'supportsEMV';

/**
 * Apple Pay requires 'supportsEMV' to be included in the merchant capabilities only when China UnionPay is supported.
 *
 * @see {@link https://developer.apple.com/documentation/applepayontheweb/applepaymerchantcapability ApplePayMerchantCapability docs}
 * @param merchantCapabilities - The merchant capabilities
 * @param supportedNetworks - The final list of Apple Pay networks
 */
export function resolveMerchantCapabilities(
    merchantCapabilities: ApplePayJS.ApplePayMerchantCapability[] | undefined,
    supportedNetworks: string[] | undefined
): ApplePayJS.ApplePayMerchantCapability[] | undefined {
    const supportsChinaUnionPay = supportedNetworks?.includes(CHINA_UNION_PAY_NETWORK);
    const capabilities = merchantCapabilities ?? [];

    if (!supportsChinaUnionPay || capabilities.includes(EMV_CAPABILITY)) {
        return merchantCapabilities;
    }

    return [...capabilities, EMV_CAPABILITY];
}
