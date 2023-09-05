import GiftcardElement from '../Giftcard/Giftcard';
import { MealVoucherFields } from './components/MealVoucherFields';

export class MealVoucherFRElement extends GiftcardElement {
    public static type = 'mealVoucher_FR';

    constructor(props) {
        super({
            ...props,
            pinRequired: true,
            expiryDateRequired: true,
            enableStoreDetails: true,
            fieldsLayoutComponent: MealVoucherFields
        });
    }

    formatProps(props) {
        return {
            brand: props.type,
            ...props
        };
    }

    private formatPaymentMethod() {
        return {
            type: this.constructor['type'],
            brand: this.props.brand,
            encryptedCardNumber: this.state.data?.encryptedCardNumber,
            encryptedSecurityCode: this.state.data?.encryptedSecurityCode,
            encryptedExpiryMonth: this.state.data?.encryptedExpiryMonth,
            encryptedExpiryYear: this.state.data?.encryptedExpiryYear
        };
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            paymentMethod: this.formatPaymentMethod(),
            ...(this.state.storePaymentMethod && { storePaymentMethod: this.state.storePaymentMethod })
        };
    }

    formatBalanceCheckData() {
        return {
            paymentMethod: this.formatPaymentMethod()
        };
    }
}

export default MealVoucherFRElement;
