import { PayButtonProps } from '../PayButton/PayButton';
import { ComponentChildren } from 'preact';
import { AnalyticsEvent } from '../../../core/Analytics/AnalyticsEvent';

// public "functions"
export interface IIssuerList {
    showValidation: () => {};
}

export interface IssuerListProps {
    items: IssuerItem[];
    showPayButton: boolean;
    payButton(props: Partial<PayButtonProps>): ComponentChildren;
    onChange(payload: any): void;
    highlightedIds?: string[];
    placeholder?: string;
    issuer?: string;
    termsAndConditions?: TermsAndConditions;
    showContextualElement?: boolean;
    contextualText?: string;
    onSubmitAnalytics: (aObj: AnalyticsEvent) => void;
    ref?: any;
}

export interface IssuerItem {
    id: string;
    name: string;
    icon?: string;
}
export interface TermsAndConditions {
    translationKey: string;
    urls: string[];
}
