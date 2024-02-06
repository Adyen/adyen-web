import { AddressData } from '../../types/global-types';

export function resolveSupportedVersion(latestVersion: number): number | null {
    const versions = [];
    for (let i = latestVersion; i > 0; i--) {
        versions.push(i);
    }

    try {
        return versions.find(v => v && window.ApplePaySession && ApplePaySession.supportsVersion(v));
    } catch (error) {
        console.warn(error);
        return null;
    }
}

export function mapBrands(brands) {
    const brandMapping = {
        mc: 'masterCard',
        amex: 'amex',
        visa: 'visa',
        elodebit: 'elo',
        elo: 'elo',
        interac: 'interac',
        discover: 'discover',
        jcb: 'jcb',
        electron: 'electron',
        maestro: 'maestro',
        girocard: 'girocard',
        cartebancaire: 'cartesBancaires',
        eftpos_australia: 'eftpos'
    };

    return brands.reduce((accumulator, item) => {
        if (!!brandMapping[item] && !accumulator.includes(brandMapping[item])) {
            accumulator.push(brandMapping[item]);
        }
        return accumulator;
    }, []);
}

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
