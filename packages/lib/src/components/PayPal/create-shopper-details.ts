export type ShopperDetails = {
    shopperName?: {
        firstName?: string;
        lastName?: string;
    };
    shopperEmail?: string;
    countryCode?: string;
    telephoneNumber?: string;
    dateOfBirth?: string;
    billingAddress?: Partial<Address>;
    shippingAddress?: Partial<Address>;
};

type Address = {
    street: string;
    stateOrProvince: string;
    city: string;
    postalCode: string;
    country: string;
    houseNumberOrName: string;
};

/**
 * Parses the Order data from PayPal, and create the shopper details object according to how Adyen expects
 */
const createShopperDetails = (order: any): ShopperDetails | null => {
    if (!order) {
        return null;
    }

    const shopperName = {
        firstName: order?.payer?.name?.given_name,
        lastName: order?.payer?.name?.surname
    };
    const shopperEmail = order?.payer?.email_address;
    const countryCode = order?.payer?.address?.country_code;
    const telephoneNumber = order?.payer?.phone?.phone_number?.national_number;
    const dateOfBirth = order?.payer?.birth_date;

    const billingAddress = mapPayPalAddressToAdyenAddressFormat({
        paypalAddressObject: order.payer?.address
    });
    const shippingAddress = mapPayPalAddressToAdyenAddressFormat({
        paypalAddressObject: order.purchase_units[0]?.shipping?.address
    });

    const shopperDetails = {
        ...(shopperName.firstName && { shopperName }),
        ...(shopperEmail && { shopperEmail }),
        ...(dateOfBirth && { dateOfBirth }),
        ...(telephoneNumber && { telephoneNumber }),
        ...(countryCode && { countryCode }),
        ...(billingAddress && { billingAddress }),
        ...(shippingAddress && { shippingAddress })
    };

    return Object.keys(shopperDetails).length > 0 ? shopperDetails : null;
};

const mapPayPalAddressToAdyenAddressFormat = ({ paypalAddressObject }): Partial<Address> | null => {
    const getStreet = (addressPart1 = null, addressPart2 = null): string | null => {
        if (addressPart1 && addressPart2) return `${addressPart1}, ${addressPart2}`;
        if (addressPart1) return addressPart1;
        if (addressPart2) return addressPart2;
        return null;
    };

    if (!paypalAddressObject) return null;

    const street = getStreet(paypalAddressObject.address_line_1, paypalAddressObject.address_line_2);

    const address = {
        ...(street && { street }),
        ...(paypalAddressObject.admin_area_1 && { stateOrProvince: paypalAddressObject.admin_area_1 }),
        ...(paypalAddressObject.admin_area_2 && { city: paypalAddressObject.admin_area_2 }),
        ...(paypalAddressObject.postal_code && { postalCode: paypalAddressObject.postal_code }),
        ...(paypalAddressObject.country_code && { country: paypalAddressObject.country_code })
    };

    return Object.keys(address).length > 0 ? address : null;
};

export { createShopperDetails };
