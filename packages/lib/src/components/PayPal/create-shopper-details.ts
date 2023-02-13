/**
 * Parses the Order data from PayPal, and create the shopper details object according to how Adyen expects
 */
const createShopperDetails = (order: any) => {
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
        paypalAddressObject: order.payer?.address,
        shopperName: `${order?.payer?.name?.given_name} ${order?.payer?.name?.surname}`.trim()
    });
    const shippingAddress = mapPayPalAddressToAdyenAddressFormat({
        paypalAddressObject: order.purchase_units[0]?.shipping?.address,
        shopperName: order.purchase_units[0]?.shipping?.name?.full_name
    });

    return {
        ...(shopperName && { shopperName }),
        ...(shopperEmail && { shopperEmail }),
        ...(dateOfBirth && { dateOfBirth }),
        ...(telephoneNumber && { telephoneNumber }),
        ...(countryCode && { countryCode }),
        ...(billingAddress && { billingAddress }),
        ...(shippingAddress && { shippingAddress })
    };
};

const mapPayPalAddressToAdyenAddressFormat = ({ paypalAddressObject, shopperName }) => {
    const getStreet = (addressPart1 = null, addressPart2 = null): string | null => {
        if (addressPart1 && addressPart2) return `${addressPart1}, ${addressPart2}`;
        if (addressPart1) return addressPart1;
        if (addressPart2) return addressPart2;
        return null;
    };

    if (!paypalAddressObject) return null;

    const street = getStreet(paypalAddressObject.address_line_1, paypalAddressObject.address_line_2);

    return {
        ...(street && { street }),
        ...(paypalAddressObject.admin_area_1 && { stateOrProvince: paypalAddressObject.admin_area_1 }),
        ...(paypalAddressObject.admin_area_2 && { city: paypalAddressObject.admin_area_2 }),
        ...(paypalAddressObject.postal_code && { postalCode: paypalAddressObject.postal_code }),
        ...(paypalAddressObject.country_code && { country: paypalAddressObject.country_code }),
        ...(shopperName && { houseNumberOrName: shopperName })
    };
};

export { createShopperDetails };
