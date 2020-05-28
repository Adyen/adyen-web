export function getAmazonPayUrl(region) {
    const suffix = region.toLowerCase() === 'us' ? 'na' : 'eu';
    return `https://static-${suffix}.payments-amazon.com/checkout.js`;
}
