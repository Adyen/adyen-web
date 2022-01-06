import GiftcardElement from '../Giftcard/Giftcard';
import { MealVoucherFields } from './components/MealVoucherFields';

export class MealVoucherFRElement extends GiftcardElement {
    public static type = 'mealVoucher_FR_natixis';

    constructor(props) {
        super({
            ...props,
            pinRequired: true,
            expiryDateRequired: true,
            fieldsLayoutComponent: MealVoucherFields
        });
    }
}

export default MealVoucherFRElement;
