import getCurrency from './getCurrency';

function parseAmount(amount: string, countryCode: string) {
    return {
        value: Number(amount),
        currency: getCurrency(countryCode)
    };
}

export { parseAmount };
