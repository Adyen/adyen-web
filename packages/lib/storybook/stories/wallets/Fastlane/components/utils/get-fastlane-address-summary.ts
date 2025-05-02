import { FastlaneShipping } from '../../../../../../src/components/PayPalFastlane/types';

/**
 * Format the PayPal address to show nicely in the Storybook UI
 */
const getAddressSummary = (shipping: FastlaneShipping) => {
    if (!shipping) return null;

    const { firstName, lastName, fullName } = shipping.name;
    const { addressLine1, addressLine2, adminArea2, adminArea1, postalCode, countryCode } = shipping.address;
    const { countryCode: telCountryCode, nationalNumber } = shipping.phoneNumber;

    const isNotEmpty = field => !!field;
    const summary = [
        fullName || [firstName, lastName].filter(isNotEmpty).join(' '),
        [addressLine1, addressLine2].filter(isNotEmpty).join(', '),
        [adminArea2, [adminArea1, postalCode].filter(isNotEmpty).join(' '), countryCode].filter(isNotEmpty).join(', '),
        [telCountryCode, nationalNumber].filter(isNotEmpty).join('')
    ];
    return summary.filter(isNotEmpty).join('\n');
};

export default getAddressSummary;
