import GiftcardElement from '../Giftcard/Giftcard';
import { MealVoucherFields } from './components/MealVoucherFields';
import { TxVariants } from '../tx-variants';
import { GiftCardConfiguration } from '../Giftcard/types';

export class MealVoucherFRElement extends GiftcardElement {
    public static type = TxVariants.mealVoucher_FR;
    public static txVariants = [
        TxVariants.mealVoucher_FR,
        TxVariants.mealVoucher_FR_natixis,
        TxVariants.mealVoucher_FR_sodexo,
        TxVariants.mealVoucher_FR_groupeup
    ];

    constructor(props: GiftCardConfiguration) {
        super({
            ...props,
            pinRequired: true,
            expiryDateRequired: true,
            fieldsLayoutComponent: MealVoucherFields
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
