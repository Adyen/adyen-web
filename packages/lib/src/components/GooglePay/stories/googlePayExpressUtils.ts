type ShippingCosts = Record<string, string>;

export const EXPRESS_DEMO_SETTINGS = {
    COUNTRY_CODE: 'BR',
    SHOPPER_LOCALE: 'en-US',
    INITIAL_AMOUNT: 10000
} as const;

/**
 * Method that calculate the shipping costs based on the country/shipping options
 *
 * @param countryCode - country code
 */
export function getShippingCostByCountry(countryCode: string): ShippingCosts {
    switch (countryCode) {
        case 'BR':
            return {
                'shipping-001': '8.00',
                'shipping-002': '25.00'
            };
        default: {
            return {
                'shipping-001': '0.00',
                'shipping-002': '5.00',
                'shipping-003': '15.00'
            };
        }
    }
}

/**
 * Method that fetches the shipping options according to the country.
 * This function in most of the cases is asynchronous, as it will request shipping options in the backend
 *
 * @param countryCode - country code
 */
export function getShippingOptions(countryCode?: string): Promise<google.payments.api.ShippingOptionParameters> {
    switch (countryCode) {
        case 'BR': {
            return Promise.resolve({
                defaultSelectedOptionId: 'shipping-001',
                shippingOptions: [
                    {
                        id: 'shipping-001',
                        label: 'R$ 8.00: Standard shipping',
                        description: 'Free Shipping delivered in 10 business days.'
                    },
                    {
                        id: 'shipping-002',
                        label: 'R$ 25.00: Super Express shipping',
                        description: 'Standard shipping delivered in 2 business days.'
                    }
                ]
            });
        }
        default: {
            return Promise.resolve({
                defaultSelectedOptionId: 'shipping-001',
                shippingOptions: [
                    {
                        id: 'shipping-001',
                        label: 'R$ 0.00: Free shipping',
                        description: 'Free Shipping delivered in 10 business days.'
                    },
                    {
                        id: 'shipping-002',
                        label: 'R$ 5.00: Fedex shipping',
                        description: 'Standard shipping delivered in 5 business days.'
                    },
                    {
                        id: 'shipping-003',
                        label: 'R$ 15.00: DHL Express shipping',
                        description: 'Express shipping delivered in 2 business day.'
                    }
                ]
            });
        }
    }
}

export function getTransactionInfo(): google.payments.api.TransactionInfo {
    return {
        displayItems: [
            {
                label: 'Subtotal',
                type: 'SUBTOTAL',
                price: '99.00'
            },
            {
                label: 'Tax',
                type: 'TAX',
                price: '1.00'
            }
        ],
        countryCode: 'BR',
        currencyCode: 'BRL',
        totalPriceStatus: 'FINAL',
        totalPrice: '100.00',
        totalPriceLabel: 'Total'
    };
}

function convertFloatAmountToAdyenAmount(totalPrice: string): number {
    if (totalPrice.includes('.')) {
        return Number(totalPrice.replace('.', ''));
    }
    return Number(`${totalPrice}00`);
}

export const createGooglePayAmountHelper = (initialAmount: number) => {
    let finalAmount = initialAmount;

    return {
        getFinalAmount() {
            return finalAmount;
        },
        setFinalAmount(amount: number) {
            finalAmount = amount;
        },
        calculateNewTransactionInfo(countryCode: string, selectedShippingOptionId: string) {
            const newTransactionInfo = getTransactionInfo();
            const shippingCost = getShippingCostByCountry(countryCode)[selectedShippingOptionId] ?? '0.00';

            newTransactionInfo.displayItems?.push({
                type: 'LINE_ITEM',
                label: 'Shipping cost',
                price: shippingCost,
                status: 'FINAL'
            });

            let totalPrice = 0.0;
            newTransactionInfo.displayItems?.forEach(displayItem => (totalPrice += parseFloat(displayItem.price)));
            newTransactionInfo.totalPrice = totalPrice.toString();

            finalAmount = convertFloatAmountToAdyenAmount(totalPrice.toString());

            return newTransactionInfo;
        }
    };
};
