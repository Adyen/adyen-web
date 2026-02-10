import { PayButtonProps } from '../PayButton/PayButton';
import { ComponentChildren } from 'preact';
import { AbstractAnalyticsEvent } from '../../../core/Analytics/events/AbstractAnalyticsEvent';

export interface IssuerListProps {
    items: IssuerItem[];
    // Component type (e.g. onlineBanking)
    type: string;
    showPayButton: boolean;
    payButton(props: PayButtonProps): ComponentChildren;
    onChange(payload: any): void;
    highlightedIds?: string[];
    placeholder?: string;
    issuer?: string;
    termsAndConditions?: TermsAndConditions;
    showContextualElement?: boolean;
    contextualText?: string;
    selectFieldLabel?: string;
    onSubmitAnalytics: (aObj: AbstractAnalyticsEvent) => void;
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
