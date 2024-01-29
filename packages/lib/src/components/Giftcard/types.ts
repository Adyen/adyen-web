import { FunctionComponent } from 'preact';
import { GiftcardFieldsProps } from './components/types';
import { UIElementProps } from '../internal/UIElement/types';
import { Order, PaymentData } from '../../types/global-types';

export interface GiftCardElementData {
    paymentMethod: {
        type: 'giftcard';
        brand: string;
        encryptedCardNumber: string;
        encryptedSecurityCode: string;
    };
}

export type balanceCheckResponseType = {
    pspReference: string;
    resultCode: string;
    balance: {
        currency: string;
        value: number;
    };
};

export type onBalanceCheckCallbackType = (
    resolve: (res: balanceCheckResponseType) => void,
    reject: (error: Error) => void,
    data: GiftCardElementData
) => Promise<void>;

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

    onRequiringConfirmation?(): void;

    /**
     * @internal
     */
    fieldsLayoutComponent?: FunctionComponent<GiftcardFieldsProps>;
}
