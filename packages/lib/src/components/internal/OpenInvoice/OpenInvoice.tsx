import { h } from 'preact';
import { useEffect, useRef, useState, useMemo } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import CompanyDetails from '../CompanyDetails';
import PersonalDetails from '../PersonalDetails';
import Address from '../Address';
import Checkbox from '../FormFields/Checkbox';
import ConsentCheckbox from '../FormFields/ConsentCheckbox';
import { getActiveFieldsData, getInitialActiveFieldsets, fieldsetsSchema, mapFieldKey } from './utils';
import {
    OpenInvoiceActiveFieldsets,
    OpenInvoiceFieldsetsRefs,
    OpenInvoiceProps,
    OpenInvoiceStateData,
    OpenInvoiceStateError,
    OpenInvoiceStateValid
} from './types';
import './OpenInvoice.scss';
import IbanInput from '../IbanInput';
import { enhanceErrorObjectKeys } from '../../../core/Errors/utils';
import { GenericError, SetSRMessagesReturnObject, SortedErrorObject } from '../../../core/Errors/types';
import useSRPanelContext from '../../../core/Errors/useSRPanelContext';
import { SetSRMessagesReturnFn } from '../../../core/Errors/SRPanelProvider';
import Specifications from '../Address/Specifications';
import { PERSONAL_DETAILS_SCHEMA } from '../PersonalDetails/PersonalDetails';
import { COMPANY_DETAILS_SCHEMA } from '../CompanyDetails/CompanyDetails';
import { setFocusOnField } from '../../../utils/setFocus';
import { ERROR_ACTION_BLUR_SCENARIO, ERROR_ACTION_FOCUS_FIELD } from '../../../core/Errors/constants';
import { usePrevious } from '../../../utils/hookUtils';
import { getArrayDifferences } from '../../../utils/arrayUtils';
import Field from '../FormFields/Field';
import FormInstruction from '../FormInstruction';
import { ComponentMethodsRef } from '../UIElement/types';
import { Status } from '../BaseElement/types';

const consentCBErrorObj: GenericError = {
    isValid: false,
    errorMessage: 'consent.checkbox.invalid',
    error: 'consent.checkbox.invalid'
};

export default function OpenInvoice(props: OpenInvoiceProps) {
    const { countryCode, visibility } = props;
    const { i18n } = useCoreContext();

    /** An object by which to expose 'public' members to the parent UIElement */
    const openInvoiceRef = useRef<ComponentMethodsRef>({});
    // Just call once
    if (!Object.keys(openInvoiceRef.current).length) {
        props.setComponentRef?.(openInvoiceRef.current);
    }

    const isValidating = useRef(false);

    /** SR stuff */
    const { setSRMessagesFromObjects, setSRMessagesFromStrings, clearSRPanel, shouldMoveFocusSR } = useSRPanelContext();

    // Generate a setSRMessages function - implemented as a partial, since the initial set of arguments don't change.
    const setSRMessages: SetSRMessagesReturnFn = setSRMessagesFromObjects?.({
        fieldTypeMappingFn: mapFieldKey
    });

    const billingAddressSpecifications = useMemo(() => new Specifications(), []);
    const deliveryAddressSpecifications = useMemo(() => new Specifications(props.deliveryAddressSpecification), []);
    /** end SR stuff */

    const initialActiveFieldsets: OpenInvoiceActiveFieldsets = getInitialActiveFieldsets(visibility, props.data);
    const [activeFieldsets, setActiveFieldsets] = useState<OpenInvoiceActiveFieldsets>(initialActiveFieldsets);

    const { current: fieldsetsRefs } = useRef<OpenInvoiceFieldsetsRefs>(
        fieldsetsSchema.reduce((acc, fieldset) => {
            acc[fieldset] = ref => {
                fieldsetsRefs[fieldset].current = ref;
            };
            return acc;
        }, {})
    );

    const checkFieldsets = () => Object.keys(activeFieldsets).every(fieldset => !activeFieldsets[fieldset] || !!valid[fieldset]);
    const hasConsentCheckbox = !!props.consentCheckboxLabel;
    const isStandAloneButton = !hasConsentCheckbox && Object.keys(activeFieldsets).every(key => !activeFieldsets[key]);
    const showSeparateDeliveryAddressCheckbox = visibility.deliveryAddress === 'editable' && visibility.billingAddress !== 'hidden';

    const [data, setData] = useState<OpenInvoiceStateData>({
        ...props.data,
        ...(hasConsentCheckbox && { consentCheckbox: false })
    });
    const [errors, setErrors] = useState<OpenInvoiceStateError>({});
    const [valid, setValid] = useState<OpenInvoiceStateValid>({});
    const [status, setStatus] = useState(Status.Ready);

    // Relates to onBlur errors
    const [sortedErrorList, setSortedErrorList] = useState<SortedErrorObject[]>(null);

    // Expose methods expected by parent
    openInvoiceRef.current.showValidation = () => {
        isValidating.current = true;
        fieldsetsSchema.forEach(fieldset => {
            if (fieldsetsRefs[fieldset].current) fieldsetsRefs[fieldset].current.showValidation();
        });

        setErrors({
            ...(hasConsentCheckbox && { consentCheckbox: data.consentCheckbox ? null : consentCBErrorObj })
        });
    };

    openInvoiceRef.current.setStatus = setStatus;

    // Get the previous value (Relates to onBlur errors)
    const previousSortedErrors = usePrevious(sortedErrorList);

    useEffect(() => {
        const fieldsetsAreValid: boolean = checkFieldsets();
        const consentCheckboxValid: boolean = !hasConsentCheckbox || !!valid.consentCheckbox;
        const isValid: boolean = fieldsetsAreValid && consentCheckboxValid;
        const newData: OpenInvoiceStateData = getActiveFieldsData(activeFieldsets, data);

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

        props.onChange({ data: newData, errors, valid, isValid });
    }, [data, activeFieldsets]);

    const handleFieldset = key => state => {
        setData(prevData => ({ ...prevData, [key]: state.data }));
        setValid(prevValid => ({ ...prevValid, [key]: state.isValid }));
        setErrors(prevErrors => ({ ...prevErrors, [key]: state.errors }));
    };

    const handleSeparateDeliveryAddress = () => {
        setActiveFieldsets(prevActiveFields => ({
            ...prevActiveFields,
            deliveryAddress: !activeFieldsets.deliveryAddress
        }));
    };

    const handleConsentCheckbox = e => {
        const { checked } = e.target;
        setData(prevData => ({ ...prevData, consentCheckbox: checked }));
        setValid(prevValid => ({ ...prevValid, consentCheckbox: checked }));
        setErrors(prevErrors => ({ ...prevErrors, consentCheckbox: !checked }));
    };
    return (
        <div className="adyen-checkout__open-invoice">
            {props.showFormInstruction && <FormInstruction />}
            {activeFieldsets.companyDetails && (
                <CompanyDetails
                    data={props.data.companyDetails}
                    label="companyDetails"
                    onChange={handleFieldset('companyDetails')}
                    setComponentRef={fieldsetsRefs.companyDetails}
                    visibility={visibility.companyDetails}
                />
            )}

            {activeFieldsets.personalDetails && (
                <PersonalDetails
                    data={props.data.personalDetails}
                    requiredFields={props.personalDetailsRequiredFields}
                    label="personalDetails"
                    onChange={handleFieldset('personalDetails')}
                    setComponentRef={fieldsetsRefs.personalDetails}
                    visibility={visibility.personalDetails}
                />
            )}

            {activeFieldsets.bankAccount && (
                <IbanInput
                    holderName={true}
                    label="bankAccount"
                    data={data.bankAccount}
                    onChange={handleFieldset('bankAccount')}
                    ref={fieldsetsRefs.bankAccount}
                />
            )}

            {activeFieldsets.billingAddress && (
                <Address
                    allowedCountries={props?.billingAddressSpecification?.allowedCountries ?? props.allowedCountries}
                    countryCode={countryCode}
                    requiredFields={props.billingAddressRequiredFields}
                    specifications={props.billingAddressSpecification}
                    data={data.billingAddress}
                    label="billingAddress"
                    onChange={handleFieldset('billingAddress')}
                    setComponentRef={fieldsetsRefs.billingAddress}
                    visibility={visibility.billingAddress}
                />
            )}

            {showSeparateDeliveryAddressCheckbox && (
                <Field
                    classNameModifiers={['separateDeliveryAddress', 'consentCheckbox']}
                    name={'separateDeliveryAddress'}
                    useLabelElement={false}
                    showErrorElement={false}
                >
                    <Checkbox
                        label={i18n.get('separateDeliveryAddress')}
                        checked={activeFieldsets.deliveryAddress}
                        classNameModifiers={['separateDeliveryAddress']}
                        name={'separateDeliveryAddress'}
                        onChange={handleSeparateDeliveryAddress}
                    />
                </Field>
            )}

            {activeFieldsets.deliveryAddress && (
                <Address
                    allowedCountries={props?.deliveryAddressSpecification?.allowedCountries ?? props.allowedCountries}
                    countryCode={countryCode}
                    requiredFields={props.deliveryAddressRequiredFields}
                    specifications={props.deliveryAddressSpecification}
                    data={data.deliveryAddress}
                    label="deliveryAddress"
                    onChange={handleFieldset('deliveryAddress')}
                    setComponentRef={fieldsetsRefs.deliveryAddress}
                    visibility={visibility.deliveryAddress}
                />
            )}

            {hasConsentCheckbox && (
                <ConsentCheckbox
                    data={data}
                    errorMessage={!!errors.consentCheckbox}
                    label={props.consentCheckboxLabel}
                    onChange={handleConsentCheckbox}
                    i18n={i18n}
                />
            )}

            {props.showPayButton &&
                props.payButton({
                    status,
                    classNameModifiers: [...(isStandAloneButton ? ['standalone'] : [])],
                    label: i18n.get('confirmPurchase')
                })}
        </div>
    );
}
