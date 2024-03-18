import { UIElementProps } from '../../internal/UIElement/types';
import { IssuerItem, TermsAndConditions } from '../../internal/IssuerList/types';

export interface IssuerListConfiguration extends UIElementProps {
    showImage?: boolean;
    placeholder?: string;
    issuers?: IssuerItem[];
    highlightedIssuers?: string[];
    showPaymentMethodItemImages?: boolean;
    termsAndConditions?: TermsAndConditions;
    showContextualElement?: boolean;
}

export interface IssuerListData {
    paymentMethod: {
        type: string;
        issuer: string;
    };
}
