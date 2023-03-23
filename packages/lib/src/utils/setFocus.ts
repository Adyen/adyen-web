import { selectOne } from '../components/internal/SecuredFields/lib/utilities/dom';

/**
 * Generic function to set focus on named element
 * @param holder -
 * @param fieldToFocus -
 */
export const setFocusOnField = (holder, fieldToFocus) => {
    const pdHolder = selectOne(document, holder);

    if (fieldToFocus === 'country' || fieldToFocus === 'stateOrProvince') {
        // Set focus on dropdown
        const field: HTMLElement = selectOne(pdHolder, `.adyen-checkout__field--${fieldToFocus} .adyen-checkout__dropdown__button`);
        field?.focus();
    } else {
        // Set focus on input
        const field: HTMLElement = selectOne(pdHolder, `[name="${fieldToFocus}"]`);
        field?.focus();
    }
};
