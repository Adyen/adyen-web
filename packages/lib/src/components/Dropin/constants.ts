/**
 * The section of the Drop-in a payment method is rendered in.
 */
export const DisplayMode = {
    fastlane: 'fastlane',
    instant: 'instant',
    stored: 'stored',
    regular: 'regular'
} as const;

/**
 * Payment method types that are allowed to render in the instant payments section of the Drop-in
 */
export const SUPPORTED_INSTANT_PAYMENTS = ['paywithgoogle', 'googlepay', 'applepay'] as const;
