import type { PhoneInputSchema } from '../../../internal/PhoneInput/types';

export interface ClickToPaySignupDetails {
    firstName?: string;
    lastName?: string;
    shopperEmail?: string;
    /**
     * Prefix and number joined in E.164 format, e.g. '+31612345678'
     */
    telephoneNumber?: string;
}

export interface ClickToPaySignupProps extends ClickToPaySignupDetails {
    /**
     * Whether the shopper gave consent to create a Click to Pay profile. The form is only shown while checked.
     */
    checked: boolean;
    /**
     * Selects the matching phone prefix when no telephoneNumber is prefilled
     */
    countryCode?: string;
    onConsentChange(checked: boolean): void;
    /**
     * Called with the current details, leaving out empty fields
     */
    onDetailsChange(details: ClickToPaySignupDetails): void;
}

export interface ClickToPaySignupFormData extends PhoneInputSchema {
    firstName?: string;
    lastName?: string;
    shopperEmail?: string;
}

export interface ClickToPaySignupState {
    consentGiven: boolean;
    details: ClickToPaySignupDetails;
}

export interface ClickToPaySignupPaymentData {
    shopperName?: { firstName?: string; lastName?: string };
    shopperEmail?: string;
    telephoneNumber?: string;
}
