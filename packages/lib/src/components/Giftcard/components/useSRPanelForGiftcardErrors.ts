import { useEffect, useState } from 'preact/hooks';
import { SetSRMessagesReturnObject } from '../../../core/Errors/types';
import useSRPanelContext from '../../../core/Errors/useSRPanelContext';
import { usePrevious } from '../../../utils/hookUtils';
import { ERROR_ACTION_BLUR_SCENARIO, ERROR_ACTION_FOCUS_FIELD } from '../../../core/Errors/constants';
import { getArrayDifferences } from '../../../utils/arrayUtils';
import { ValidationRuleResult } from '../../../utils/Validator/ValidationRuleResult';
import { setFocusOnField } from '../../../utils/setFocus';
import { SetSRMessagesReturnFn } from '../../../core/Errors/SRPanelProvider';

/**
 * Interface for gift card field errors, matching the encrypted field types
 */
export interface GiftcardStateErrors {
    encryptedCardNumber: ValidationRuleResult;
    encryptedSecurityCode: ValidationRuleResult;
}

/**
 * Interface for transformed error objects returned from mapErrorsToValidationRuleResult
 */
export interface TransformedError {
    isValid: boolean;
    errorMessage: string;
    errorI18n: string;
    error: string;
    rootNode: HTMLElement;
}

/**
 * Interface for errors object with transformed error entries
 */
export interface TransformedErrorsObj {
    [key: string]: TransformedError | null;
}

/**
 * Props interface for the error handling hook
 */
interface UseSRPanelForGiftcardErrorsProps {
    errors: TransformedErrorsObj;
    isValidating: { current: boolean } | boolean;
}

/**
 * Interface for sorted error objects used for comparison
 */
interface SortedErrorObject {
    field: string;
    errorMessage: string;
}

/**
 * Custom hook for handling gift card component errors and screen reader announcements
 *
 * This hook manages both visual and screen reader error announcements for the gift card component,
 * handling both blur-based validation errors and form-wide validation errors.
 */
export const useSRPanelForGiftcardErrors = ({ errors, isValidating }: UseSRPanelForGiftcardErrorsProps) => {
    console.log('useSRPanelForGiftcardErrors errors', errors);
    // Track sorted list of errors for comparison with previous state
    const [sortedErrorList, setSortedErrorList] = useState<SortedErrorObject[]>(null);
    // Track previous error list for detecting changes
    const previousSortedErrors = usePrevious(sortedErrorList);

    // Get SRPanel context for managing screen reader messages
    const { setSRMessagesFromObjects, setSRMessagesFromStrings, clearSRPanel, shouldMoveFocusSR } = useSRPanelContext();

    // Fixed layout array defining the order of fields for error sorting
    const layout = ['encryptedCardNumber', 'encryptedSecurityCode'];

    useEffect(() => {
        try {
            // Create a partial function for setting SR messages with fixed configuration
            const setMessages: SetSRMessagesReturnFn = setSRMessagesFromObjects?.({});
            // Set messages with current errors and layout
            // Handle isValidating being either an object with current property or a boolean
            const isValidatingValue = typeof isValidating === 'boolean' ? isValidating : isValidating?.current || false;

            const srPanelResp: SetSRMessagesReturnObject = setMessages?.({
                errors,
                isValidating: isValidatingValue,
                layout
            });

            // Store the sorted list of errors for comparison
            const currentErrorsSortedByLayout = srPanelResp?.currentErrorsSortedByLayout;
            setSortedErrorList(currentErrorsSortedByLayout);

            // Handle different error scenarios based on the action type
            switch (srPanelResp?.action) {
                case ERROR_ACTION_FOCUS_FIELD:
                    // When a field needs to be focused due to validation error
                    if (shouldMoveFocusSR) {
                        setFocusOnField('.adyen-checkout__giftcard', srPanelResp.fieldToFocus);
                    }
                    // Reset validation state after 300ms to allow for error collection
                    setTimeout(() => {
                        if (typeof isValidating === 'boolean') {
                            isValidating = false;
                        } else if (isValidating?.current !== undefined) {
                            isValidating.current = false;
                        }
                    }, 300);
                    break;

                case ERROR_ACTION_BLUR_SCENARIO: {
                    // Handle blur-based validation errors
                    const difference = getArrayDifferences(currentErrorsSortedByLayout, previousSortedErrors, 'field');
                    const latestErrorMsg = difference?.[0];

                    if (latestErrorMsg) {
                        // Only announce blur-based errors to screen reader
                        const isBlurBasedError = true;
                        const latestSRError = isBlurBasedError ? latestErrorMsg.errorMessage : null;
                        setSRMessagesFromStrings(latestSRError);
                    } else {
                        // Clear SR panel if there are no more errors
                        clearSRPanel();
                    }
                    break;
                }
            }
        } catch (_) {
            // Fail silently - we don't want to break the component if SRPanel fails
            console.error('Error in useSRPanelForGiftcardErrors', _);
        }
    }, [errors]);
};
