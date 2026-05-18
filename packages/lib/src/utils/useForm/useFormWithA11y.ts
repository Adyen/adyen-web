import { useCallback, useEffect, useState } from 'preact/hooks';
import { RefObject } from 'preact';
import useForm from './useForm';
import { useErrorFocus } from './useErrorFocus';
import { Form, FormProps } from './types';

export interface FormWithA11yProps extends FormProps {
    /**
     * DOM Element, CSS selector string, or RefObject pointing to the form root.
     * Used to find and focus the first invalid field after submit-time validation.
     */
    formHolder: Element | string | RefObject<Element>;
}

/**
 * Wraps useForm and adds submit-time focus management via useErrorFocus.
 * Adds inline aria-live announcements on Field error spans, without requiring an SRPanel.
 *
 * Usage:
 * - Pass `formHolder` (CSS selector or Element ref) to enable focus-on-first-error.
 * - Set `errorLive={true}` on the Field components inside the form so their error spans
 *   announce changes via aria-live="polite".
 */
function useFormWithA11y<FormSchema>(props: FormWithA11yProps): Form<FormSchema> {
    const { formHolder, ...formProps } = props;
    const form = useForm<FormSchema>(formProps);
    const { focusFirstError } = useErrorFocus(formHolder);

    // Tracks whether we are in a submit-triggered validation pass.
    // A state (not ref) so the useEffect below reacts to it alongside form.errors.
    const [isValidating, setIsValidating] = useState(false);

    const triggerValidation = useCallback(
        (selectedSchema = null) => {
            setIsValidating(true);
            form.triggerValidation(selectedSchema);
        },
        [form.triggerValidation]
    );

    // After errors update from a submit-time validation, focus the first error field.
    // Blur-time validations (isValidating === false) do NOT trigger focus management.
    useEffect(() => {
        if (!isValidating) return;
        focusFirstError(form.errors, form.schema);
        setIsValidating(false);
    }, [form.errors, form.schema, focusFirstError]);

    return {
        ...form,
        triggerValidation
    };
}

export default useFormWithA11y;
