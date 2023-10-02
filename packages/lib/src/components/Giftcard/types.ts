import { UIElementProps } from '../types';
import { FunctionComponent } from 'preact';
import { GiftcardFieldsProps } from './components/types';

export interface GiftCardElementData {
    paymentMethod: {
        type: 'giftcard';
        brand: string;
        encryptedCardNumber: string;
        encryptedSecurityCode: string;
    };
}

// TODO: Fix these types
export interface GiftCardProps extends UIElementProps {
    pinRequired?: boolean;
    expiryDateRequired?: boolean;
    brandsConfiguration?: any;
    brand?: string;
    onOrderCreated?(data): void;
    onOrderRequest?(resolve, reject, data): void;
    onBalanceCheck?(resolve, reject, data): void;
    onRequiringConfirmation?(): void;
    /**
     * @internal
     */
    fieldsLayoutComponent?: FunctionComponent<GiftcardFieldsProps>;
}
