/**
 * We are handling delivery methods update, validations, and final amount calculation on the UI side for DEMO purposes.
 * This must be implemented on the backend side by the merchant for safety reasons.
 */

export function getDeliveryMethodsByCountry(country: string) {
    if (country === 'NL') {
        return [
            {
                reference: '1',
                description: 'PostNL (5 days)',
                type: 'Shipping',
                amount: {
                    currency: 'USD',
                    value: '500'
                },
                selected: true
            },
            {
                reference: '2',
                description: 'DHL (1 day)',
                type: 'Shipping',
                amount: {
                    currency: 'USD',
                    value: '999'
                },
                selected: false
            },
            {
                reference: '3',
                description: 'Pick up',
                type: 'Shipping',
                amount: {
                    currency: 'USD',
                    value: '0'
                },
                selected: false
            }
        ];
    }

    if (country === 'US') {
        return [
            {
                reference: '1',
                description: 'Express Shipping',
                type: 'Shipping',
                amount: {
                    currency: 'USD',
                    value: '1599'
                },
                selected: false
            },
            {
                reference: '2',
                description: 'Standard Ground',
                type: 'Shipping',
                amount: {
                    currency: 'USD',
                    value: '500'
                },
                selected: false
            },
            {
                reference: '3',
                description: 'Teleport Shipping Ultra fast',
                type: 'Shipping',
                amount: {
                    currency: 'USD',
                    value: '5000'
                },
                selected: false
            }
        ];
    }

    throw Error('INVALID COUNTRY CODE');
}

export function getDeliveryMethods({ countryCode, deliveryMethodId }) {
    const deliveryMethods = getDeliveryMethodsByCountry(countryCode);

    const options = deliveryMethods.map(method => {
        method.selected = method.reference === deliveryMethodId;
        return method;
    });

    return options;
}

export function getSelectedDeliveryMethodAmount({ countryCode, deliveryMethodId }) {
    const deliveryMethods = getDeliveryMethodsByCountry(countryCode);
    const option = deliveryMethods.find(method => method.reference === deliveryMethodId);
    return Number(option.amount.value);
}
