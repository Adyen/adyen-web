import GiftcardElement from '../Giftcard/Giftcard';

export class MealVoucherFRElement extends GiftcardElement {
    public static type = 'mealVoucher_FR_natixis';

    constructor(props) {
        super({
            ...props,
            pinRequired: true,
            expiryDateRequired: true
        });
    }
}

export default MealVoucherFRElement;
