import { Meta, StoryObj } from '@storybook/preact';
import UIElement from '../../src/components/internal/UIElement';
import { SubmitActions } from '../../src/core/types';

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

export type StoryConfiguration<T> = StoryObj<PaymentMethodStoryProps<T>>;

export type MetaConfiguration<T> = Meta<PaymentMethodStoryProps<T>>;

export type AdyenCheckoutProps = {
    showPayButton: boolean;
    countryCode: string;
    shopperLocale: string;
    amount: number;
    onSubmit?: (data: any, element?: UIElement, actions?: SubmitActions) => void;
    onPaymentCompleted?: (data: any, element?: UIElement) => void;
};
