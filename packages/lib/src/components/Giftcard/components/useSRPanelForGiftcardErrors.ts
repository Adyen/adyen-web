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
interface GiftcardStateErrors {
    encryptedCardNumber: ValidationRuleResult;
    encryptedSecurityCode: ValidationRuleResult;
}

/**
 * Interface for transformed error objects returned from mapErrorsToValidationRuleResult
 */
interface TransformedError {
    isValid: boolean;
    errorMessage: string;
    errorI18n: string;
    error: string;
    rootNode: HTMLElement;
}

/**
 * Interface for errors object with transformed error entries
 */
interface TransformedErrorsObj {
    [key: string]: TransformedError | null;
}

/**
 * Props interface for the error handling hook
 */
interface UseSRPanelForGiftcardErrorsProps {
    errors: TransformedErrorsObj;
    isValidating: boolean;
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
const useSRPanelForGiftcardErrors = ({ errors, isValidating }: UseSRPanelForGiftcardErrorsProps) => {
    // Track sorted list of errors for comparison with previous state
    const [sortedErrorList, setSortedErrorList] = useState<SortedErrorObject[]>(null);
    // Track previous error list for detecting changes
    const previousSortedErrors = usePrevious(sortedErrorList);

    // Get SRPanel context for managing screen reader messages
    const { setSRMessagesFromObjects, setSRMessagesFromStrings, clearSRPanel, shouldMoveFocusSR } = useSRPanelContext();

    // Fixed layout array defining the order of fields for error sorting
    // Assume fields in this order, and adds encryptedExpiryDate for MealVoucher, this is ignored in giftcard
    const layout = ['encryptedCardNumber', 'encryptedExpiryDate', 'encryptedSecurityCode'];

    useEffect(() => {
        try {
            // Create a partial function for setting SR messages with fixed configuration
            const setMessages: SetSRMessagesReturnFn = setSRMessagesFromObjects?.({});
            // Set messages with current errors and layout

            // Unlike Card SR Panel, isValidating is a boolean
            const srPanelResp: SetSRMessagesReturnObject = setMessages?.({
                errors,
                isValidating,
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
                    // Remove 'showValidation' mode - allowing time for collation of all the fields in error whilst it is 'showValidation' mode (some errors come in a second render pass)
                    setTimeout(() => {
                        if (typeof isValidating === 'boolean') {
                            isValidating = false;
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
        }
    }, [errors]);
};

// Export all interfaces and the hook
export type { GiftcardStateErrors, TransformedError, TransformedErrorsObj };

export { useSRPanelForGiftcardErrors };
