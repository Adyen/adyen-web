import { isValidHttpUrl } from '../../../../../utils/isValidURL';
import type { FastlaneSignupConfiguration } from '../../../../PayPalFastlane/types';

type ConfigurationKey = keyof FastlaneSignupConfiguration;

const VALID_KEYS: ConfigurationKey[] = [
    'showConsent',
    'defaultToggleState',
    'termsAndConditionsLink',
    'privacyPolicyLink',
    'termsAndConditionsVersion',
    'fastlaneSessionId'
];

/**
 * Verifies that Fastlane configuration for Card component is valid
 * - If the consent can be shown, then validate that all required fields are valid
 * - If the consent should not be shown, then validate the showConsent is valid boolean
 *
 * @param config
 */
const isConfigurationValid = (config: FastlaneSignupConfiguration): boolean => {
    if (!config) {
        return false;
    }

    Object.keys(config).forEach(
        (key: keyof FastlaneSignupConfiguration) =>
            !VALID_KEYS.includes(key) && console.warn(`Fastlane: '${key}' is not valid Fastlane config property`)
    );

    const { showConsent, defaultToggleState, termsAndConditionsLink, privacyPolicyLink, termsAndConditionsVersion } = config;

    let isValid: boolean = false;

    if (showConsent) {
        isValid =
            isValidHttpUrl(privacyPolicyLink) &&
            isValidHttpUrl(termsAndConditionsLink) &&
            typeof showConsent === 'boolean' &&
            typeof defaultToggleState === 'boolean' &&
            !!termsAndConditionsVersion;
    } else {
        isValid = typeof showConsent === 'boolean';
    }

    if (!isValid) {
        console.warn('Fastlane: Component configuration is not valid. Fastlane will not be displayed');
    }

    return isValid;
};

export { isConfigurationValid };
