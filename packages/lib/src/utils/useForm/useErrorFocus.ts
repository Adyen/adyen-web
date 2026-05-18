import { useCallback } from 'preact/hooks';
import { RefObject } from 'preact';
import { setFocusOnField } from '../setFocus';

function resolveHolder(holder: Element | string | RefObject<Element>): Element | string | undefined {
    if (holder && typeof holder === 'object' && 'current' in holder) return holder.current;
    return holder as Element | string | undefined;
}

/**
 * Hook that provides a utility to focus the first invalid field in a form.
 * Uses the existing setFocusOnField utility which handles dropdowns, iOS scroll quirks, etc.
 *
 * @param holder - DOM Element, CSS selector string, or a RefObject pointing to the form root element
 */
export function useErrorFocus(holder: Element | string | RefObject<Element>) {
    const focusFirstError = useCallback(
        (errors: Record<string, unknown>, schema: string[]) => {
            const resolvedHolder = resolveHolder(holder);
            if (!resolvedHolder) return;
            const firstErrorKey = schema.find(key => errors[key]);
            if (firstErrorKey) {
                setFocusOnField(resolvedHolder, firstErrorKey);
            }
        },
        [holder]
    );

    return { focusFirstError };
}
