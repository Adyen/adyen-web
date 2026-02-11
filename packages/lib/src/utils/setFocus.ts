import { selectOne } from '../components/internal/SecuredFields/lib/utilities/dom';
import { handleScrollTo } from './handleScrollTo';
import ua from '../components/internal/SecuredFields/lib/CSF/utils/userAgent';

/**
 * Generic function to set focus on named element
 * @param holder - DOM element or CSS selector string to search within
 * @param fieldToFocus - Name of the field to focus on
 * @param focusContextSelector - some fields can occur twice in a form but in a different context e.g. as part of a billingAddress or as part of a deliverySddress.
 * This param provides the context so we can select them correctly
 */
export const setFocusOnField = (holder: Element | string, fieldToFocus: string, focusContextSelector = '') => {
    // If holder is already a DOM element, use it directly; otherwise query for it
    const pdHolder = holder instanceof Element ? holder : selectOne(document, holder);

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

        if (ua.__IS_IOS) {
            handleScrollTo(field);
        }

        field?.focus();
    } else {
        // Set focus on input
        const field: HTMLElement = selectOne(pdHolder, `${focusContextSelector} [name="${fieldToFocus}"]`);

        if (ua.__IS_IOS) {
            handleScrollTo(field);
        }

        field?.focus();
    }
};
