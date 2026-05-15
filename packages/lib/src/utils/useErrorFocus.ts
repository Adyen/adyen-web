import { useCallback } from 'preact/hooks';
import { setFocusOnField } from './setFocus';

/**
 * Hook that provides a utility to focus the first invalid field in a form.
 * Uses the existing setFocusOnField utility which handles dropdowns, iOS scroll quirks, etc.
 *
 * @param holder - DOM Element or CSS selector string identifying the form root
 */
export function useErrorFocus(holder: Element | string) {
    const focusFirstError = useCallback(
        (errors: Record<string, unknown>, schema: string[]) => {
            if (!holder) return;
            const firstErrorKey = schema.find(key => errors[key]);
            if (firstErrorKey) {
                setFocusOnField(holder, firstErrorKey);
            }
        },
        [holder]
    );

    return { focusFirstError };
}
