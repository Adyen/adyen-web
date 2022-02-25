import DropinPage from '../../_models/Dropin.page';
import GiftCardPage from '../../_models/GiftCardComponent.page';

const dropinPage = new DropinPage({
    components: {
        giftcard: new GiftCardPage('.adyen-checkout__payment-method--giftcard')
    }
});

fixture`Testing Giftcard with brandsConfiguration in Dropin`
    .beforeEach(async t => {
        await t.navigateTo(dropinPage.pageUrl);
    })
    .clientScripts('./brandsConfiguration.clientScripts.js');

test('#1 Check Giftcard comp receives custom name and icon from brandsConfiguration object', async t => {
    // Wait for el to appear in DOM
    await dropinPage.giftcard.pmHolder();

    // Custom name
    await t.expect(dropinPage.giftcard.nameSpan.innerText).eql('Gifty mcGiftface');

    // Custom card icon
    await t.expect(dropinPage.giftcard.brandingIcon.getAttribute('src')).contains('mc.svg');
});
