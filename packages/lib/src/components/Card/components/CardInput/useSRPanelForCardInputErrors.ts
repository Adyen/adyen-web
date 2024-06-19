import { useEffect, useState } from 'preact/hooks';
import useSRPanelContext from '../../../../core/Errors/useSRPanelContext';
import { SetSRMessagesReturnFn } from '../../../../core/Errors/SRPanelProvider';
import { handlePartialAddressMode, lookupBlurBasedErrors, mapFieldKey } from './utils';
import { usePrevious } from '../../../../utils/hookUtils';
import { SetSRMessagesReturnObject, SortedErrorObject } from '../../../../core/Errors/types';
import { ERROR_ACTION_BLUR_SCENARIO, ERROR_ACTION_FOCUS_FIELD } from '../../../../core/Errors/constants';
import { setFocusOnFirstField } from './handlers';
import { getArrayDifferences } from '../../../../utils/arrayUtils';

const useSRPanelForCardInputErrors = ({ errors, props, isValidating, retrieveLayout, specifications, billingAddress, sfp }) => {
    // Extract fns from context
    const { setSRMessagesFromObjects, setSRMessagesFromStrings, clearSRPanel, shouldMoveFocusSR } = useSRPanelContext();

    // Generate a setSRMessages function - implemented as a partial, since the initial set of arguments don't change.
    const setSRMessages: SetSRMessagesReturnFn = setSRMessagesFromObjects?.({
        fieldTypeMappingFn: mapFieldKey
    });

    const partialAddressSchema = handlePartialAddressMode(props.billingAddressMode);

    const [sortedErrorList, setSortedErrorList] = useState<SortedErrorObject[]>(null);

    // Get the previous list of errors
    const previousSortedErrors = usePrevious(sortedErrorList);

    const sfStateErrorsObj = sfp.current?.mapErrorsToValidationRuleResult();
    const mergedErrors = { ...errors, ...sfStateErrorsObj };

    useEffect(() => {
        try {
            // Extract and then flatten billingAddress errors into a new object with *all* the field errors at top level
            const { billingAddress: extractedAddressErrors, ...errorsWithoutAddress } = mergedErrors;

            const errorsForPanel = { ...errorsWithoutAddress, ...extractedAddressErrors };

            // Pass dynamic props (errors, layout etc) to SRPanel via partial
            const srPanelResp: SetSRMessagesReturnObject = setSRMessages?.({
                errors: errorsForPanel,
                isValidating: isValidating.current,
                layout: retrieveLayout(),
                // If we don't have country specific address labels, we might have a label related to a partialAddressSchema (i.e. zipCode)
                countrySpecificLabels: specifications.getAddressLabelsForCountry(billingAddress?.country) ?? partialAddressSchema?.default?.labels
            });

            // Store the array of sorted error objects separately so that we can use it to make comparisons between the old and new arrays
            const currentErrorsSortedByLayout = srPanelResp?.currentErrorsSortedByLayout;
            setSortedErrorList(currentErrorsSortedByLayout);

            /**
             * Need extra actions after setting SRPanel messages in order to focus field (if required) and because we have some errors that are fired onBlur
             */
            switch (srPanelResp?.action) {
                // A call to focus the first field in error will always follow the call to validate the whole form
                case ERROR_ACTION_FOCUS_FIELD:
                    if (shouldMoveFocusSR) setFocusOnFirstField(isValidating.current, sfp, srPanelResp?.fieldToFocus);
                    // Remove 'showValidation' mode - allowing time for collation of all the fields in error whilst it is 'showValidation' mode (some errors come in a second render pass)
                    setTimeout(() => {
                        isValidating.current = false;
                    }, 300);
                    break;
                /** On blur scenario: not validating, i.e. trying to submit form, but there might be an error, either to set or to clear */
                case ERROR_ACTION_BLUR_SCENARIO: {
                    const difference = getArrayDifferences<SortedErrorObject, string>(currentErrorsSortedByLayout, previousSortedErrors, 'field');

                    const latestErrorMsg = difference?.[0];

                    if (latestErrorMsg) {
                        // Use the error code to look up whether error is actually a blur based one (most are but some SF ones aren't)
                        const isBlurBasedError = lookupBlurBasedErrors(latestErrorMsg.errorCode);

                        /**
                         *  ONLY ADD BLUR BASED ERRORS TO THE ERROR PANEL - doing this step prevents the non-blur based errors from being read out twice
                         *  (once from the aria-live, error panel & once from the aria-describedby element)
                         */
                        const latestSRError = isBlurBasedError ? latestErrorMsg.errorMessage : null;
                        // console.log('### CardInput2::componentDidUpdate:: #2 (not validating) single error:: latestSRError', latestSRError);
                        setSRMessagesFromStrings(latestSRError);
                    } else {
                        // called when previousSortedErrors.length >= currentErrorsSortedByLayout.length
                        // console.log('### CardInput2::componentDidUpdate:: #3(not validating) clearing errors:: NO latestErrorMsg');
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
    }, [errors]);

    return { sortedErrorList, previousSortedErrors, clearSRPanel };
};

export default useSRPanelForCardInputErrors;
