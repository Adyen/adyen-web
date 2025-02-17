import { AddressData } from '../../../types/global-types';

/**
 * This function formats Apple Pay contact format to Adyen address format
 *
 * Setting 'houseNumberOrName' to ZZ won't affect the AVS check, and it will make the algorithm take the
 * house number from the 'street' property.
 */
export function formatApplePayContactToAdyenAddressFormat(
    paymentContact: ApplePayJS.ApplePayPaymentContact,
    isDeliveryAddress?: boolean
): AddressData | undefined {
    if (!paymentContact) {
        return;
    }

    return {
        city: paymentContact.locality,
        country: paymentContact.countryCode,
        houseNumberOrName: 'ZZ',
        postalCode: paymentContact.postalCode,
        street: paymentContact.addressLines?.join(' ').trim(),
        ...(paymentContact.administrativeArea && { stateOrProvince: paymentContact.administrativeArea }),
        ...(isDeliveryAddress && {
            firstName: paymentContact.givenName,
            lastName: paymentContact.familyName
        })
    };
}
