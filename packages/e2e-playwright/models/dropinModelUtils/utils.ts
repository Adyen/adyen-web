import { Dropin } from '../dropin';
import { getImageCount } from '../../tests/utils/image';
import { USER_TYPE_DELAY } from '../../tests/utils/constants';

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

export const typeIntoSecuredField = async (pm, iframeTitle, iframeInputLabel, text) => {
    const sfIframe = pm.frameLocator(`[title="${iframeTitle}"]`);
    const sfInput = sfIframe.locator(`input[aria-label="${iframeInputLabel}"]`);

    await sfInput.type(text, { delay: USER_TYPE_DELAY });
};
