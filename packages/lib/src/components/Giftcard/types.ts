import { FunctionComponent } from 'preact';
import { GiftcardFieldsProps } from './components/types';
import { UIElementProps } from '../internal/UIElement/types';
import { Order, OrderUpdatedData, PaymentAmount, PaymentData } from '../../types/global-types';
import type { BrandConfiguration } from '../internal/SecuredFields/lib/types';
import type { Placeholders } from './components/types';

export interface GiftCardBrandConfiguration extends BrandConfiguration {
    /**
     * Placeholders for this gift card brand. Keys not set here fall back to the top-level `placeholders`.
     */
    placeholders?: Placeholders;
}

export type GiftCardBrandsConfiguration = Record<string, GiftCardBrandConfiguration>;


export interface GiftCardElementData {
    paymentMethod: {
        type: 'giftcard';
        brand: string;
        encryptedCardNumber: string;
        encryptedSecurityCode: string;
    };
}

export type balanceCheckResponseType = {
    sessionData?: string;
    pspReference?: string;
    resultCode?: string;
    balance?: PaymentAmount;
    transactionLimit?: PaymentAmount;
};

export type onBalanceCheckCallbackType = (
    resolve: (res: balanceCheckResponseType) => void,
    reject: (error: Error) => void,
    data: GiftCardElementData
) => Promise<void>;

export type onOrderUpdatedCallbackType = (data: OrderUpdatedData) => void;

export type onRequiringConfirmationCallbackType = (resolve: () => void, reject: (error: Error) => void) => Promise<void>;

export type onOrderRequestCallbackType = (resolve: (order: Order) => void, reject: (error: Error) => void, data: PaymentData) => Promise<void>;

// TODO: Fix these types
export interface GiftCardConfiguration extends UIElementProps {
    pinRequired?: boolean;
    expiryDateRequired?: boolean;
    brandsConfiguration?: GiftCardBrandsConfiguration;
    /**
     * Placeholders for the gift card fields. Used for every brand, unless a brand sets its own in `brandsConfiguration`.
     */
    placeholders?: Placeholders;
    brand?: string;
    onOrderUpdated?: onOrderUpdatedCallbackType;
    onBalanceCheck?: onBalanceCheckCallbackType;
    onOrderRequest?: onOrderRequestCallbackType;

    onRequiringConfirmation?: onRequiringConfirmationCallbackType;

    /**
     * @internal
     */
    fieldsLayoutComponent?: FunctionComponent<GiftcardFieldsProps>;
}

/**
 * Unified error interface that matches useForm error structure for gift cards
 */
export interface GiftCardValidationError {
    isValid: boolean;
    errorMessage: string;
    errorI18n?: string;
    error?: string; // Original error code
}

/**
 * Errors synthesized client-side from a successful (2xx) balance check response.
 * These are rendered inline, next to the gift card number field.
 */
export const BALANCE_CHECK_ERRORS = ['no-balance', 'card-error', 'currency-error'] as const;

export type KnownBalanceCheckError = (typeof BALANCE_CHECK_ERRORS)[number];

/**
 * `unknown-error` covers everything we cannot attribute to the card itself
 * (5xx, network, CORS, timeout, a merchant calling `reject()`) and is rendered
 * as a banner rather than an inline field error.
 */
export type GiftCardBalanceCheckErrorType = KnownBalanceCheckError | 'unknown-error';
