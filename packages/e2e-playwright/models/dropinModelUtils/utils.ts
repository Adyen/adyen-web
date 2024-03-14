import { Dropin } from '../dropin';
import { getImageCount } from '../../tests/utils/image';

export const getCreditCardPM_withBrandsInfo = (dropin: Dropin) => {
    const creditCard = dropin.getPaymentMethodItem('Cards');

    const brandsHolder = creditCard.locator('.adyen-checkout__payment-method__brands');

    const brandsText = brandsHolder.locator('.adyen-checkout__payment-method__brand-number');

    const componentBrandsHolder = creditCard.locator('.adyen-checkout__card__brands');

    return {
        pm: creditCard,
        brandsHolder,
        brandsText,
        componentBrandsHolder,
        getImageCount
    };
};
