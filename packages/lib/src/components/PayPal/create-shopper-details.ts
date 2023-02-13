/**
 * Parses the Order data from PayPal, and create the shopper details object according to how Adyen expects
 */
const createShopperDetails = (order: any) => {
    const paypalShippingAddress = order.purchase_units[0]?.shipping?.address;
    const paypalBillingAddress = order.payer?.address;

    const shopperName = order?.payer?.name?.given_name;
    const shopperEmail = order?.payer?.email_address;
    const countryCode = order?.payer?.address?.country_code;
    const billingAddress = createAddress(paypalBillingAddress);
    const shippingAddress = createAddress(paypalShippingAddress);

    return {
        ...(shopperName && { shopperName }),
        ...(shopperEmail && { shopperEmail }),
        ...(countryCode && { countryCode }),
        ...(billingAddress && { billingAddress }),
        ...(shippingAddress && { shippingAddress })
    };
};

const createAddress = (paypalAddressObject: any) => {
    const getStreet = (addressPart1 = '', addressPart2) => {
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
        ...(paypalAddressObject.country_code && { country: paypalAddressObject.country_code })
    };
};

export { createShopperDetails };
