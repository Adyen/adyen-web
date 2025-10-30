import { FunctionComponent } from 'preact';
import { GiftcardFieldsProps } from './components/types';
import { UIElementProps } from '../internal/UIElement/types';
import { Order, PaymentAmount, PaymentData } from '../../types/global-types';

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

export type onRequiringConfirmationCallbackType = (resolve: () => void, reject: (error: Error) => void) => Promise<void>;

export type onOrderRequestCallbackType = (resolve: (order: Order) => void, reject: (error: Error) => void, data: PaymentData) => Promise<void>;

// TODO: Fix these types
export interface GiftCardConfiguration extends UIElementProps {
    pinRequired?: boolean;
    expiryDateRequired?: boolean;
    brandsConfiguration?: any;
    brand?: string;
    onOrderUpdated?: (data) => void;
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

export type GiftCardBalanceCheckErrorType = 'no-balance' | 'card-error' | 'currency-error';
