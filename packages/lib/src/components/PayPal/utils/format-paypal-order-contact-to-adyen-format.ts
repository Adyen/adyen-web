import { AddressData } from '../../../types/global-types';

/**
 * This function formats PayPal contact format to Adyen address format
 */
export const formatPaypalOrderContatcToAdyenFormat = (paymentContact: any, isDeliveryAddress?: boolean): AddressData | null => {
    const getStreet = (addressPart1 = null, addressPart2 = null): string | null => {
        if (addressPart1 && addressPart2) return `${addressPart1}, ${addressPart2}`;
        if (addressPart1) return addressPart1;
        if (addressPart2) return addressPart2;
        return null;
    };

    if (paymentContact?.address === undefined) return null;

    const { address, name } = paymentContact;
    const street = getStreet(address.address_line_1, address.address_line_2);

    return {
        houseNumberOrName: 'ZZ',
        ...(street && { street }),
        ...(address.admin_area_1 && { stateOrProvince: address.admin_area_1 }),
        ...(address.admin_area_2 && { city: address.admin_area_2 }),
        ...(address.postal_code && { postalCode: address.postal_code }),
        ...(address.country_code && { country: address.country_code }),
        ...(isDeliveryAddress && {
            firstName: name.full_name
        })
    };
};
