import { CARDS_URL } from '../../pages';
import { start } from '../../utils/commonUtils';
import { REGULAR_TEST_CARD } from '../utils/constants';
import CardComponentPage from '../../_models/CardComponent.page';
import { CLIENTSCRIPT_PARTIAL_AVS_WITH_COUNTRY, CLIENTSCRIPT_PARTIAL_AVS_WITHOUT_COUNTRY } from './avs.partial.clientScripts';

const TEST_SPEED = 1;
const INVALID_POSTALCODE = 'aaaaaaaaaa';

let cardPage = null;

fixture`Card with Partial AVS`.page(CARDS_URL).beforeEach(() => {
    cardPage = new CardComponentPage();
});

test('should validate Postal Code if property data.billingAddress.country is provided', async t => {
    // Start, allow time for iframes to load
    await start(t, 2000, TEST_SPEED);

    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
    await cardPage.cardUtils.fillDateAndCVC(t);

    // Fill in wrong Postal code format
    await t.typeText(cardPage.postalCodeInput, INVALID_POSTALCODE);
    await t.click(cardPage.payButton);

    await t.expect(cardPage.postalCodeErrorText.innerText).contains('Invalid format. Expected format: 99999999');
}).clientScripts({ content: CLIENTSCRIPT_PARTIAL_AVS_WITH_COUNTRY });

test('should not validate Postal Code if property data.billingAddress.country is not provided', async t => {
    // Start, allow time for iframes to load
    await t.setNativeDialogHandler(() => true);
    await start(t, 2000, TEST_SPEED);

    await cardPage.cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
    await cardPage.cardUtils.fillDateAndCVC(t);

    // Fill in wrong Postal code format
    await t.typeText(cardPage.postalCodeInput, INVALID_POSTALCODE);
    await t.click(cardPage.payButton);

    // Check the value of the alert text
    const history = await t.getNativeDialogHistory();
    await t.expect(history[0].text).eql('Authorised');
}).clientScripts({ content: CLIENTSCRIPT_PARTIAL_AVS_WITHOUT_COUNTRY });
