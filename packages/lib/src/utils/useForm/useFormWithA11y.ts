import { useCallback, useEffect, useState } from 'preact/hooks';
import type { RefObject } from 'preact';
import useForm from './useForm';
import useSRPanelContext from '../../core/Errors/useSRPanelContext';
import { ERROR_ACTION_BLUR_SCENARIO, ERROR_ACTION_FOCUS_FIELD } from '../../core/Errors/constants';
import { setFocusOnField } from '../setFocus';
import { usePrevious } from '../hookUtils';
import { getArrayDifferences } from '../arrayUtils';
import type { FieldTypeMappingFn, SetSRMessagesReturnObject } from '../../core/Errors/types';
import type { SetSRMessagesReturnFn } from '../../core/Errors/SRPanelProvider';
import { Form, FormProps } from './types';

export interface A11yFormConfig {
    /**
     * Field ordering for SR error announcements on submit.
     * Defaults to the form schema, which is sufficient when display order matches schema order.
     * Only needs to be set explicitly for complex forms with address sub-fields or other non-linear layouts.
     */
    layout?: string[];
    /**
     * Ref to the form root element used to scope the focus query when moving focus to the first invalid field.
     * When omitted, focus management is skipped and only SR announcements are made.
     */
    formRef?: RefObject<HTMLElement>;
    /** Maps a field key to its translated label, used to build SR error messages for generic keys like 'field.error.required'. */
    fieldTypeMappingFn?: FieldTypeMappingFn;
}

export interface FormWithA11y<FormSchema> extends Form<FormSchema> {
    /** Directly announces a message via the SR panel, e.g. for API-level errors that are not part of form validation. */
    announceError: (msg: string) => void;
}

function useFormWithA11y<FormSchema>(props: FormProps & A11yFormConfig): FormWithA11y<FormSchema> {
    const { layout, formRef, fieldTypeMappingFn, ...formProps } = props;
    const form = useForm<FormSchema>(formProps);
    const { setSRMessagesFromObjects, setSRMessagesFromStrings, clearSRPanel, shouldMoveFocusSR } = useSRPanelContext();

    const [isValidating, setIsValidating] = useState(false);
    const [sortedErrorList, setSortedErrorList] = useState(null);
    const previousSortedErrors = usePrevious(sortedErrorList);

    const triggerValidation = useCallback(
        (selectedSchema = null) => {
            setIsValidating(true);
            form.triggerValidation(selectedSchema);
        },
        [form.triggerValidation]
    );

    const announceError = useCallback(
        (msg: string) => {
            setSRMessagesFromStrings?.(msg);
        },
        [setSRMessagesFromStrings]
    );

    useEffect(() => {
        try {
            const effectiveLayout = layout ?? form.schema;
            const setSRMessages: SetSRMessagesReturnFn = setSRMessagesFromObjects?.({ fieldTypeMappingFn });
            const srPanelResp: SetSRMessagesReturnObject = setSRMessages?.({
                errors: form.errors,
                isValidating,
                layout: effectiveLayout
            });

            const currentErrors = srPanelResp?.currentErrorsSortedByLayout;
            setSortedErrorList(currentErrors);

            switch (srPanelResp?.action) {
                case ERROR_ACTION_FOCUS_FIELD:
                    if (shouldMoveFocusSR && formRef?.current) {
                        setFocusOnField(formRef.current, srPanelResp.fieldToFocus);
                    }
                    setTimeout(() => setIsValidating(false), 300);
                    break;

                case ERROR_ACTION_BLUR_SCENARIO: {
                    const difference = getArrayDifferences(currentErrors, previousSortedErrors, 'field');
                    const latestError = difference?.[0];
                    if (latestError) {
                        setSRMessagesFromStrings?.(latestError.errorMessage);
                    } else {
                        clearSRPanel?.();
                    }
                    break;
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
            // fail silently - don't break the component if SRPanel fails
        }
    }, [form.errors]);

    return {
        ...form,
        triggerValidation,
        announceError
    };
}

export default useFormWithA11y;
