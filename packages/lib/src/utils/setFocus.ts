import { selectOne } from '../components/internal/SecuredFields/lib/utilities/dom';
import { windowScrollTo } from './windowScrollTo';
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

    let field: HTMLElement;

    // Identify if we're dealing with a dropdown
    if (
        fieldToFocus === 'country' ||
        fieldToFocus === 'stateOrProvince' ||
        fieldToFocus === 'issuer-list' ||
        fieldToFocus === 'selectedAccountType'
    ) {
        // Set focus on dropdown
        field = selectOne(pdHolder, `${focusContextSelector}.adyen-checkout__field--${fieldToFocus} .adyen-checkout__filter-input`);
    } else {
        // Set focus on input
        field = selectOne(pdHolder, `${focusContextSelector} [name="${fieldToFocus}"]`);
    }

    // Fix for iOS scrolling issues: can't programmatically set focus on an element on iOS, so we scroll to it instead, so at least it is in view
    if (ua.__IS_IOS) {
        windowScrollTo(field);
    }

    field?.focus({ preventScroll: ua.__IS_IOS }); // Don't even attempt to allow the focus call to trigger a scroll on iOS
};
