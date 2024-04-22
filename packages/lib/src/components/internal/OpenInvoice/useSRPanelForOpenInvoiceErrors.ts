import { useEffect, useState, useMemo, MutableRef } from 'preact/hooks';
import { enhanceErrorObjectKeys } from '../../../core/Errors/utils';
import { COMPANY_DETAILS_SCHEMA } from '../CompanyDetails/CompanyDetails';
import { PERSONAL_DETAILS_SCHEMA } from '../PersonalDetails/PersonalDetails';
import { SetSRMessagesReturnObject } from '../../../core/Errors/types';
import { ERROR_ACTION_BLUR_SCENARIO, ERROR_ACTION_FOCUS_FIELD } from '../../../core/Errors/constants';
import useSRPanelContext from '../../../core/Errors/useSRPanelContext';
import { SetSRMessagesReturnFn } from '../../../core/Errors/SRPanelProvider';
import Specifications from '../Address/Specifications';
import { setFocusOnField } from '../../../utils/setFocus';
import { usePrevious } from '../../../utils/hookUtils';
import { getArrayDifferences } from '../../../utils/arrayUtils';
import { mapFieldKey } from './utils';
import { OpenInvoiceProps, OpenInvoiceStateData, OpenInvoiceStateError } from './types';

interface UseSRPanelForErrorsProps {
    errors: OpenInvoiceStateError;
    data: OpenInvoiceStateData;
    props: OpenInvoiceProps;
    isValidating: MutableRef<boolean>;
}

const useSRPanelForOpenInvoiceErrors = ({ errors, data, props, isValidating }: UseSRPanelForErrorsProps) => {
    // Relates to onBlur errors
    const [sortedErrorList, setSortedErrorList] = useState(null);
    // Get the previous value (Relates to onBlur errors)
    const previousSortedErrors = usePrevious(sortedErrorList);
    const { setSRMessagesFromObjects, setSRMessagesFromStrings, clearSRPanel, shouldMoveFocusSR } = useSRPanelContext();
    // Generate a setSRMessages function - implemented as a partial, since the initial set of arguments don't change.
    const setSRMessages: SetSRMessagesReturnFn = setSRMessagesFromObjects?.({
        fieldTypeMappingFn: mapFieldKey
    });

    const billingAddressSpecifications = useMemo(() => new Specifications(), []);
    const deliveryAddressSpecifications = useMemo(() => new Specifications(props.deliveryAddressSpecification), []);

    useEffect(() => {
        try {
            const DELIVERY_ADDRESS_PREFIX = 'deliveryAddress:';
            const BILLING_ADDRESS_PREFIX = 'billingAddress:';

            /** Create messages for SRPanel */
            // Extract nested errors from the various child components...
            const {
                companyDetails: extractedCompanyDetailsErrors,
                personalDetails: extractedPersonalDetailsErrors,
                bankAccount: extractedBankAccountErrors,
                billingAddress: extractedBillingAddressErrors,
                deliveryAddress: extractedDeliveryAddressErrors,
                ...remainingErrors
            } = errors;

            // Differentiate between billingAddress and deliveryAddress errors by adding a prefix.
            // This also allows overlapping errors e.g. now that addresses can contain first & last name fields
            const enhancedBillingAddressErrors = enhanceErrorObjectKeys(extractedBillingAddressErrors, BILLING_ADDRESS_PREFIX);
            const enhancedDeliveryAddressErrors = enhanceErrorObjectKeys(extractedDeliveryAddressErrors, DELIVERY_ADDRESS_PREFIX);

            // ...and then collate the errors into a new object so that they all sit at top level
            const errorsForPanel = {
                ...(typeof extractedCompanyDetailsErrors === 'object' && extractedCompanyDetailsErrors),
                ...(typeof extractedPersonalDetailsErrors === 'object' && extractedPersonalDetailsErrors),
                ...(typeof extractedBankAccountErrors === 'object' && extractedBankAccountErrors),
                ...(typeof enhancedBillingAddressErrors === 'object' && enhancedBillingAddressErrors),
                ...(typeof enhancedDeliveryAddressErrors === 'object' && enhancedDeliveryAddressErrors),
                ...remainingErrors
            };

            // Create layout
            const companyDetailsLayout: string[] = COMPANY_DETAILS_SCHEMA;

            const personalDetailsReqFields: string[] = props.personalDetailsRequiredFields ?? PERSONAL_DETAILS_SCHEMA;
            const personalDetailLayout: string[] = PERSONAL_DETAILS_SCHEMA.filter(x => personalDetailsReqFields?.includes(x));

            const bankAccountLayout = ['holder', 'iban'];

            const billingAddressLayout = billingAddressSpecifications.getAddressSchemaForCountryFlat(data.billingAddress?.country);
            // In order to sort the address errors the layout entries need to have the same (prefixed) identifier as the errors themselves
            const billingAddressLayoutEnhanced = billingAddressLayout.map(item => `${BILLING_ADDRESS_PREFIX}${item}`);

            const deliveryAddressLayout = deliveryAddressSpecifications.getAddressSchemaForCountryFlat(data.deliveryAddress?.country);
            const deliveryAddressLayoutEnhanced = deliveryAddressLayout.map(item => `${DELIVERY_ADDRESS_PREFIX}${item}`);

            const fullLayout = companyDetailsLayout.concat(
                personalDetailLayout,
                bankAccountLayout,
                billingAddressLayoutEnhanced,
                deliveryAddressLayoutEnhanced,
                ['consentCheckbox']
            );

            // Country specific address labels
            const countrySpecificLabels_billing = billingAddressSpecifications.getAddressLabelsForCountry(data.billingAddress?.country);
            const countrySpecificLabels_delivery = deliveryAddressSpecifications.getAddressLabelsForCountry(data.deliveryAddress?.country);

            // Set messages: Pass dynamic props (errors, layout etc) to SRPanel via partial
            const srPanelResp: SetSRMessagesReturnObject = setSRMessages?.({
                errors: errorsForPanel,
                isValidating: isValidating.current,
                layout: fullLayout,
                countrySpecificLabels: { ...countrySpecificLabels_billing, ...countrySpecificLabels_delivery }
            });

            // Relates to onBlur errors
            const currentErrorsSortedByLayout = srPanelResp?.currentErrorsSortedByLayout;

            // Store the array of sorted error objects separately so that we can use it to make comparisons between the old and new arrays
            setSortedErrorList(currentErrorsSortedByLayout); // Relates to onBlur errors

            /**
             * Need extra actions after setting SRPanel messages in order to focus field (if required) and because we have some errors that are fired onBlur
             */
            switch (srPanelResp?.action) {
                // A call to focus the first field in error will always follow the call to validate the whole form
                case ERROR_ACTION_FOCUS_FIELD:
                    // Focus first field in error, if required
                    if (shouldMoveFocusSR) setFocusOnField('.adyen-checkout__open-invoice', srPanelResp.fieldToFocus);
                    // Remove 'showValidation' mode - allowing time for collation of all the fields in error whilst it is 'showValidation' mode (some errors come in a second render pass)
                    setTimeout(() => {
                        isValidating.current = false;
                    }, 300);
                    break;

                /** On blur scenario: not validating, i.e. trying to submit form, but there might be an error, either to set or to clear */
                case ERROR_ACTION_BLUR_SCENARIO: {
                    const difference = getArrayDifferences(currentErrorsSortedByLayout, previousSortedErrors, 'field');

                    const latestErrorMsg = difference?.[0];

                    if (latestErrorMsg) {
                        // Is error actually a blur based one - depends on the specific fields in a component as to whether they validate on blur
                        const isBlurBasedError = latestErrorMsg.errorCode === 'shopperEmail.invalid';

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
        } catch (e) {
            console.warn('Error in useSafeSRPanelForErrors', e);
        }
    }, [errors, data.billingAddress, data.deliveryAddress]);
};

export default useSRPanelForOpenInvoiceErrors;
