import { DropinElementProps } from '../../src/components/Dropin/types';

type GlobalStoryProps = {
    useSessions: boolean;
    countryCode: string;
    shopperLocale: string;
    amount: number;
    showPayButton: boolean;
};

export interface PaymentMethodStoryProps<T> extends GlobalStoryProps {
    componentConfiguration: T;
}

export interface DropinStoryProps extends PaymentMethodStoryProps<DropinElementProps> {
    paymentMethodsConfiguration: any;
}

export type AdyenCheckoutProps = {
    showPayButton: boolean;
    paymentMethodsConfiguration?: Record<string, object>;
    countryCode: string;
    shopperLocale: string;
    amount: number;
};
