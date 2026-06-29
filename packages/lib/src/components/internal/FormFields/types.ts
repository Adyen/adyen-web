/**
 * WCAG 2.2 Input Purposes autocomplete tokens.
 * @see https://www.w3.org/TR/WCAG22/#input-purposes
 */
export type AutocompleteToken =
    // Name tokens
    | 'name'
    | 'given-name'
    | 'family-name'
    | 'additional-name'
    | 'honorific-prefix'
    | 'honorific-suffix'
    | 'nickname'
    // Contact tokens
    | 'email'
    | 'tel'
    | 'tel-country-code'
    | 'tel-national'
    // Address tokens
    | 'street-address'
    | 'address-line1'
    | 'address-line2'
    | 'address-line3'
    | 'address-level1'
    | 'address-level2'
    | 'postal-code'
    | 'country'
    | 'country-name'
    // Billing-prefixed address tokens
    | 'billing street-address'
    | 'billing address-line1'
    | 'billing address-line2'
    | 'billing address-level1'
    | 'billing address-level2'
    | 'billing postal-code'
    | 'billing country'
    | 'billing country-name'
    // Shipping-prefixed address tokens
    | 'shipping street-address'
    | 'shipping address-line1'
    | 'shipping address-line2'
    | 'shipping address-level1'
    | 'shipping address-level2'
    | 'shipping postal-code'
    | 'shipping country'
    | 'shipping country-name'
    // Date tokens
    | 'bday'
    | 'bday-day'
    | 'bday-month'
    | 'bday-year'
    // Credit card tokens
    | 'cc-name'
    | 'cc-number'
    | 'cc-exp'
    | 'cc-exp-month'
    | 'cc-exp-year'
    | 'cc-csc'
    | 'cc-type'
    // Organization
    | 'organization'
    | 'organization-title';

/**
 * Autocomplete attribute value for input fields.
 *
 * - Pass a valid WCAG token for fields that should support autofill
 * - Pass 'off' to explicitly disable autocomplete (renders autocomplete="off")
 * - Pass undefined to omit the autocomplete attribute entirely
 *
 * @see https://www.w3.org/TR/WCAG22/#input-purposes
 */
export type AutocompleteValue = AutocompleteToken | 'off' | undefined;
