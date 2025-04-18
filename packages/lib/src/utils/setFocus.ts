import { selectOne } from '../components/internal/SecuredFields/lib/utilities/dom';

/**
 * Generic function to set focus on named element
 * @param holder -
 * @param fieldToFocus -
 * @param focusContextSelector - some fields can occur twice in a form but in a different context e.g. as part of a billingAddress or as part of a deliverySddress.
 * This param provides the context so we can select them correctly
 */
export const setFocusOnField = (holder, fieldToFocus, focusContextSelector = '') => {
    const pdHolder = selectOne(document, holder);

    // Identify if we're dealing with a dropdown
    if (
        fieldToFocus === 'country' ||
        fieldToFocus === 'stateOrProvince' ||
        fieldToFocus === 'issuer-list' ||
        fieldToFocus === 'selectedAccountType'
    ) {
        // Set focus on dropdown
        const field: HTMLElement = selectOne(
            pdHolder,
            `${focusContextSelector}.adyen-checkout__field--${fieldToFocus} .adyen-checkout__filter-input`
        );
        field?.focus();
    } else {
        // Set focus on input
        const field: HTMLElement = selectOne(pdHolder, `${focusContextSelector} [name="${fieldToFocus}"]`);
        field?.focus();
    }
};
