import { PayButtonProps } from '../PayButton/PayButton';
import { ComponentChildren, h } from 'preact';

export interface IssuerListProps {
    items: IssuerItem[];
    showPayButton: boolean;
    payButton(props: Partial<PayButtonProps>): ComponentChildren;
    onChange(payload: any): void;
    highlightedIds?: string[];
    placeholder?: string;
    issuer?: string;
    termsAndConditions?(): string | h.JSX.Element;
}

export interface IssuerItem {
    id: string;
    name: string;
    icon?: string;
}
