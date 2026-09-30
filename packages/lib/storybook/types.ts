import { Meta, StoryObj } from '@storybook/preact';
import UIElement from '../src/components/internal/UIElement';
import { AddressData, CoreConfiguration, MandateType, PaymentMethodsResponse } from '../src/types';

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
    Omit<CoreConfiguration, 'amount'> & {
        useSessions: boolean;
        redirectResult?: string;
        sessionId?: string;
        'srConfig.showPanel'?: boolean;
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

export type SessionsRequestData = {
    shopperEmail?: string;
    shopperReference?: string;
    mandate?: Partial<MandateType>;
    splitCardFundingSources?: boolean;
    installmentOptions?: Record<string, { values: number[]; plans?: string[] }>;
    storePaymentMethod?: boolean;
    storePaymentMethodMode?: 'enabled' | 'disabled' | 'askForConsent';
    shopperInteraction?: 'Ecommerce' | 'ContAuth' | 'Moto' | 'POS';
    recurringProcessingModel?: 'Subscription' | 'CardOnFile' | 'UnscheduledCardOnFile';
    enableOneClick?: boolean;
};

export type AdyenCheckoutProps = {
    showPayButton: boolean;
    countryCode: string;
    shopperLocale: string;
    amount: number;
    sessionData?: SessionsRequestData;
    allowedPaymentTypes?: string[];
    /**
     * Sent on the `/paymentMethods` request, so the backend does the filtering. Unlike
     * `allowedPaymentTypes`, which trims the response after it arrives, these exercise the real
     * allow/block pipeline, including the edits it makes inside a payment method's own sub-arrays.
     *
     * Storybook drops the inline array syntax from URL args, so several types have to be indexed
     * (`blockedPaymentMethods[0]:scheme;blockedPaymentMethods[1]:upi`) and a single one arrives as
     * a plain string (`blockedPaymentMethods:emi`).
     */
    blockedPaymentMethods?: string[] | string;
    /** Request-side counterpart of `blockedPaymentMethods`; see the note above on URL-arg syntax. */
    allowedPaymentMethods?: string[] | string;
    paymentMethodsOverride?: PaymentMethodsResponse;
    paymentsOptions?: {}; // TODO we don't have proper type for this right now
    onPaymentCompleted?: (data: unknown, element?: UIElement) => void;
    srConfig: { showPanel: boolean; moveFocus: boolean };
};
