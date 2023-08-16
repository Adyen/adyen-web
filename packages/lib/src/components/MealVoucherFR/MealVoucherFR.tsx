import GiftcardElement from '../Giftcard/Giftcard';
import { MealVoucherFields } from './components/MealVoucherFields';
import Core from '../../core';

export class MealVoucherFRElement extends GiftcardElement {
    public static type = 'mealVoucher_FR';
    public static txVariants = ['mealVoucher_FR_natixis', 'mealVoucher_FR_sodexo', 'mealVoucher_FR_groupeup'];

    constructor(checkoutRef: Core, props) {
        super(checkoutRef, {
            ...props,
            pinRequired: true,
            expiryDateRequired: true,
            fieldsLayoutComponent: MealVoucherFields,
            type: props?.type ?? MealVoucherFRElement.type
        });
    }

    formatProps(props) {
        return {
            brand: props.type,
            ...props
        };
    }

    /**
     * Formats the component data output
     */
    formatData() {
        return {
            paymentMethod: {
                type: this.constructor['type'],
                brand: this.props.brand,
                encryptedCardNumber: this.state.data?.encryptedCardNumber,
                encryptedSecurityCode: this.state.data?.encryptedSecurityCode,
                encryptedExpiryMonth: this.state.data?.encryptedExpiryMonth,
                encryptedExpiryYear: this.state.data?.encryptedExpiryYear
            }
        };
    }
}

export default MealVoucherFRElement;
