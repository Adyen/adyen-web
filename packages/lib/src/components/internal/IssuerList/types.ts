import { PayButtonProps } from '../PayButton/PayButton';
import { ComponentChildren } from 'preact';

export interface IssuerListProps {
    items: IssuerItem[];
    showPayButton: boolean;
    payButton(props: Partial<PayButtonProps>): ComponentChildren;
    onChange(payload: any): void;
    placeholder?: string;
    issuer?: string;
    predefinedIssuers?: IssuerItem[];
}

export interface IssuerItem {
    id: string;
    name: string;
    icon?: string;
}
