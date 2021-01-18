import { Selector, ClientFunction } from 'testcafe';
import { ISSUERLISTS_URL } from '../../pages';

fixture`Testing iDeal (IssuerLists)`.page(`${ISSUERLISTS_URL}?countryCode=NL`);

const getComponentData = ClientFunction(() => {
    return window.ideal.data;
});

test.only('should make an iDeal payment', async t => {
    // Opens dropdown
    await t
        .click(Selector('.adyen-checkout__dropdown__button'))
        .expect(Selector('.adyen-checkout__dropdown__list').hasClass('adyen-checkout__dropdown__list--active'))
        .ok();

    await t.click(Selector('.adyen-checkout__dropdown__list').child(0));

    await t.expect(getComponentData()).eql({
        paymentMethod: {
            type: 'ideal',
            issuer: '1121'
        },
        clientStateDataIndicator: true
    });
});
