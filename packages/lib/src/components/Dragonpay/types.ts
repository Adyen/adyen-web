import { PaymentAmount } from '../../types/global-types';
import Language from '../../language/Language';
import { UIElementProps } from '../internal/UIElement/types';

export interface DragonpayInputIssuerItem {
    id: string;
    name: string;
    icon?: string;
}

export interface DragonpayConfiguraton extends UIElementProps {
    type?: string;
    issuers?: DragonpayInputIssuerItem[];

    /** @deprecated use issuers */
    details?: any;

    loadingContext?: string;
    reference?: string;
    i18n?: Language;
}

export interface DragonpayInputData {
    issuer?: string;
    shopperEmail?: string;
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
