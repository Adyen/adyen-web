import { Meta, StoryObj } from '@storybook/preact';

type GlobalStoryProps = {
    useSessions: boolean;
    countryCode: string;
    shopperLocale: string;
    amount: number;
    showPayButton: boolean;
};

export interface PaymentMethodStoryProps<T> extends GlobalStoryProps {
    // Core is passed in the 'render' step, so no need to enforce it here
    componentConfiguration: Omit<T, 'core'>;
}

export type StoryConfiguration<T> = StoryObj<PaymentMethodStoryProps<T>>;

export type MetaConfiguration<T> = Meta<PaymentMethodStoryProps<T>>;

export type AdyenCheckoutProps = {
    showPayButton: boolean;
    countryCode: string;
    shopperLocale: string;
    amount: number;
};
