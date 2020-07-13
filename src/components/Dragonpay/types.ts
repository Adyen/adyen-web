import { PaymentAmount } from '../../types';
import Language from '../../language/Language';

export interface DragonpayInputIssuerItem {
    id?: string;
    name?: string;
    icon?: string;
}

export interface DragonpayElementProps {
    type?: string;
    details?: DragonpayInputIssuerItem[];
    items?: DragonpayInputIssuerItem[];
    loadingContext?: string;
    reference?: string;
    i18n?: Language;
}

export interface DragonpayInputData {
    issuer?: string;
    shopperEmail?: string;
}

export interface DragonpayInputErrors {
    issuer?: boolean;
    shopperEmail?: boolean;
}

export interface DragonpayInputProps {
    data: DragonpayInputData;
    issuer?: string;
    items?: DragonpayInputIssuerItem[];
    type?: string;
    onChange: (state) => void;
    onSubmit?: (state, component) => void;
    showPayButton?: boolean;
    payButton: any;
    ref?: any;
}

export interface DragonpayVoucherResultProps {
    reference?: string;
    totalAmount?: PaymentAmount;
    expiresAt?: string;
    paymentMethodType?: string;
    instructionsUrl?: string;
    surcharge?: PaymentAmount;
    alternativeReference?: string;
    icon?: string;
    issuer?: string;
    ref?: any;
}
