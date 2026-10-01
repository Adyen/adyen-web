import type { PayPalServiceRefreshConfig } from '../services/PayPalService';

/**
 * Compares two PayPal service configurations.
 *
 * @remarks
 * Every field is compared explicitly, instead of relying on a generic deep comparison, so that adding a new
 * field to the configuration is a conscious decision: a mismatch re-creates the PayPal SDK instance and the
 * eligible payment methods, which discards the rendered PayPal buttons and costs a couple of network requests.
 *
 * @param config - The current configuration
 * @param otherConfig - The configuration to compare against
 * @returns Whether both configurations would produce the same SDK instance and eligible payment methods
 */
export const isPayPalServiceConfigEqual = (config: PayPalServiceRefreshConfig, otherConfig: PayPalServiceRefreshConfig): boolean =>
    config.loadingContext === otherConfig.loadingContext &&
    config.clientKey === otherConfig.clientKey &&
    config.merchantId === otherConfig.merchantId &&
    config.countryCode === otherConfig.countryCode &&
    config.vault === otherConfig.vault &&
    config.locale === otherConfig.locale &&
    config.pageType === otherConfig.pageType &&
    config.environment === otherConfig.environment &&
    config.amount?.value === otherConfig.amount?.value &&
    config.amount?.currency === otherConfig.amount?.currency &&
    config.components.length === otherConfig.components.length &&
    config.components.every((component, index) => component === otherConfig.components[index]);
