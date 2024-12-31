import { isValidHttpUrl } from '../../../../../utils/isValidURL';
import type { FastlaneSignupConfiguration } from '../../../../PayPalFastlane/types';

const isConfigurationValid = ({
    showConsent,
    defaultToggleState,
    termsAndConditionsLink,
    privacyPolicyLink,
    termsAndConditionsVersion,
    fastlaneSessionId
}: FastlaneSignupConfiguration) => {
    const isValid =
        isValidHttpUrl(privacyPolicyLink) &&
        isValidHttpUrl(termsAndConditionsLink) &&
        typeof showConsent === 'boolean' &&
        typeof defaultToggleState === 'boolean' &&
        !!termsAndConditionsVersion &&
        !!fastlaneSessionId;

    if (!isValid) {
        console.warn('Fastlane: Component configuration is not valid. Fastlane will not be displayed');
    }

    return isValid;
};

export { isConfigurationValid };
