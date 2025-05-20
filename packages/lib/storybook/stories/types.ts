import { Meta, StoryObj } from '@storybook/preact';
import UIElement from '../../src/components/internal/UIElement';
import { AddressData, CoreConfiguration, PaymentMethodsResponse } from '../../src/types';

export type ShopperDetails = {
    shopperName: {
        firstName: string;
        lastName: string;
    };
    telephoneNumber: string;
    shopperEmail: string;
    dateOfBirth: string;
    shopperIP: string;
    deliveryAddress: AddressData;
    billingAddress: AddressData;
};

export type GlobalStoryProps = AdyenCheckoutProps &
    CoreConfiguration & {
        useSessions: boolean;
    };

export interface PaymentMethodStoryProps<T> extends GlobalStoryProps {
    componentConfiguration: T;
}

export interface CardPaymentMethodStoryProps<Q> extends PaymentMethodStoryProps<Q> {
    force3DS2Redirect: boolean;
}

export type StoryConfiguration<T> = StoryObj<PaymentMethodStoryProps<T>>;

export type CustomCardStoryConfiguration<Q> = StoryObj<CardPaymentMethodStoryProps<Q>>;

export type MetaConfiguration<T> = Meta<PaymentMethodStoryProps<T>>;

export type AdyenCheckoutProps = {
    showPayButton: boolean;
    countryCode: string;
    shopperLocale: string;
    amount: number;
    sessionData?: PaymentMethodsResponse;
    allowedPaymentTypes?: string[];
    paymentMethodsOverride?: PaymentMethodsResponse;
    paymentsOptions?: {}; // TODO we don't have proper type for this right now
    onPaymentCompleted?: (data: any, element?: UIElement) => void;
};
