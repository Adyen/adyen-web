import { FunctionComponent } from 'preact';
import { GiftcardFieldsProps } from './components/types';
import { UIElementProps } from '../internal/UIElement/types';
import { Order, PaymentAmount, PaymentData } from '../../types/global-types';
import type { CardBrandsConfiguration } from '../internal/SecuredFields/lib/types';

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

export type onOrderUpdatedCallbackType = (data: { order: Order }) => void;

export type onRequiringConfirmationCallbackType = (resolve: () => void, reject: (error: Error) => void) => Promise<void>;

export type onOrderRequestCallbackType = (resolve: (order: Order) => void, reject: (error: Error) => void, data: PaymentData) => Promise<void>;

// TODO: Fix these types
export interface GiftCardConfiguration extends UIElementProps {
    pinRequired?: boolean;
    expiryDateRequired?: boolean;
    brandsConfiguration?: CardBrandsConfiguration;
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
