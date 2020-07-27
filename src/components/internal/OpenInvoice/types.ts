import { AddressSchema, FieldsetVisibility, PersonalDetailsSchema } from '../../../types';

export interface OpenInvoiceProps {
    consentCheckbox: any;
    countryCode: string;
    data: {
        personalDetails?: PersonalDetailsSchema;
        billingAddress?: AddressSchema;
        deliveryAddress?: AddressSchema;
    };
    onChange: Function;
    payButton: any;
    showPayButton?: boolean;
    visibility?: {
        personalDetails?: FieldsetVisibility;
        billingAddress?: FieldsetVisibility;
        deliveryAddress?: FieldsetVisibility;
    };
}

export interface OpenInvoiceStateData {
    personalDetails?: PersonalDetailsSchema;
    billingAddress?: AddressSchema;
    deliveryAddress?: AddressSchema;
    consentCheckbox?: boolean;
    separateDeliveryAddress?: boolean;
}

export interface OpenInvoiceStateError {
    consentCheckbox?: boolean;
    billingAddress?: boolean;
    deliveryAddress?: boolean;
    personalDetails?: boolean;
}

export interface OpenInvoiceStateValid {
    consentCheckbox?: boolean;
    billingAddress?: boolean;
    deliveryAddress?: boolean;
    personalDetails?: boolean;
}
