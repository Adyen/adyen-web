import { useEffect, useState, MutableRef } from 'preact/hooks';
import { SetSRMessagesReturnObject } from '../../../core/Errors/types';
import useSRPanelContext from '../../../core/Errors/useSRPanelContext';
import { SetSRMessagesReturnFn } from '../../../core/Errors/SRPanelProvider';
import { usePrevious } from '../../../utils/hookUtils';
import { ERROR_ACTION_BLUR_SCENARIO, ERROR_ACTION_FOCUS_FIELD } from '../../../core/Errors/constants';
import { setFocusOnField } from '../../../utils/setFocus';
import { getArrayDifferences } from '../../../utils/arrayUtils';
import { AchStateData, AchStateErrors } from '../types';

interface UseSRPanelForErrorsProps {
    errors: AchStateErrors;
    data: AchStateData;
    isValidating: MutableRef<boolean>;
}

const useSRPanelForACHErrors = ({ errors, data, isValidating }: UseSRPanelForErrorsProps) => {
    // Relates to onBlur errors
    const [sortedErrorList, setSortedErrorList] = useState(null);
    // Get the previous value (Relates to onBlur errors)
    const previousSortedErrors = usePrevious(sortedErrorList);
    const { setSRMessagesFromObjects, setSRMessagesFromStrings, clearSRPanel, shouldMoveFocusSR } = useSRPanelContext();
    const setSRMessages: SetSRMessagesReturnFn = setSRMessagesFromObjects?.({});

    // Fixed layout for the ACH comp
    const layout = ['selectedAccountType', 'ownerName', 'routingNumber', 'accountNumber', 'accountNumberVerification'];

    useEffect(() => {
        try {
            const srPanelResp: SetSRMessagesReturnObject = setSRMessages?.({ errors, isValidating: isValidating.current, layout });

            // Relates to onBlur errors
            const currentErrorsSortedByLayout = srPanelResp?.currentErrorsSortedByLayout;
            // Store the array of sorted error objects separately so that we can use it to make comparisons between the old and new arrays
            setSortedErrorList(currentErrorsSortedByLayout);

            /**
             * Need extra actions after setting SRPanel messages in order to focus field (if required) and because we have some errors that are fired onBlur
             */
            switch (srPanelResp?.action) {
                // A call to focus the first field in error will always follow the call to validate the whole form
                case ERROR_ACTION_FOCUS_FIELD:
                    // Focus field in error, if required
                    if (shouldMoveFocusSR) setFocusOnField('.adyen-checkout__ach', srPanelResp.fieldToFocus);
                    // Remove 'showValidation' mode - allowing time for collation of all the fields in error whilst it is 'showValidation' mode (some errors come in a second render pass)
                    setTimeout(() => {
                        isValidating.current = false;
                    }, 300);
                    break;

                /**
                 * Relates to errors triggered by a field blurring (some pm forms have this, some don't) - check if there is an error to either set or to clear
                 */
                case ERROR_ACTION_BLUR_SCENARIO: {
                    const difference = getArrayDifferences(currentErrorsSortedByLayout, previousSortedErrors, 'field');

                    const latestErrorMsg = difference?.[0];

                    if (latestErrorMsg) {
                        // Is error actually a blur based one - depends on the specific fields in a component as to whether they validate on blur
                        // In the case of the ACH form currently all the fields validate on blur
                        const isBlurBasedError = true;

                        // Only add blur based errors to the error panel - doing this step prevents the non-blur based errors from being read out twice
                        const latestSRError = isBlurBasedError ? latestErrorMsg.errorMessage : null;
                        setSRMessagesFromStrings(latestSRError);
                    } else {
                        // called when previousSortedErrors.length >= currentErrorsSortedByLayout.length
                        clearSRPanel();
                    }
                    break;
                }
                default:
                    break;
            }
        } catch (_) {
            // We don't handle the error related to the sr panel, let it fail silently.
        }
    }, [errors, data]);
};

export default useSRPanelForACHErrors;
