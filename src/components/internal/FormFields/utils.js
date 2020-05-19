/**
 * Reference: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html
 * @private
 */
const AUTOCOMPLETE_VALUES = {
    city: 'address-level2',
    country: 'country',
    dateOfBirth: 'bday',
    firstName: 'given-name',
    gender: 'sex',
    holderName: 'cc-name',
    houseNumberOrName: 'address-line2',
    infix: 'additional-name',
    lastName: 'family-name',
    postalCode: 'postal-code',
    shopperEmail: 'email',
    stateOrProvince: 'address-level1',
    street: 'address-line1',
    telephoneNumber: 'tel'
};

/**
 * @private
 */
export const returnAutoComplete = key => AUTOCOMPLETE_VALUES[key] || 'on';
