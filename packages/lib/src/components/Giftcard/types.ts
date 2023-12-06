import { FunctionComponent } from 'preact';
import { GiftcardFieldsProps } from './components/types';
import { UIElementProps } from '../internal/UIElement/types';

export interface GiftCardElementData {
    paymentMethod: {
        type: 'giftcard';
        brand: string;
        encryptedCardNumber: string;
        encryptedSecurityCode: string;
    };
}

// TODO: Fix these types
export interface GiftCardConfiguration extends UIElementProps {
    pinRequired?: boolean;
    expiryDateRequired?: boolean;
    brandsConfiguration?: any;
    brand?: string;
    onOrderUpdated?(data): void;
    onOrderRequest?(resolve, reject, data): void;
    onBalanceCheck?(resolve, reject, data): void;
    onRequiringConfirmation?(): void;
    /**
     * @internal
     */
    fieldsLayoutComponent?: FunctionComponent<GiftcardFieldsProps>;
}
