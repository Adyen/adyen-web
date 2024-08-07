import { Selector } from 'testcafe';
import { start, getIsValid } from '../utils/commonUtils';
import { BASE_URL } from '../pages';

const checkboxLabel = Selector('.adyen-checkout__bacs .adyen-checkout__checkbox');
//const checkboxAmount = Selector('.adyen-checkout__input--amountConsentCheckbox');
//const checkboxAccount = Selector('.adyen-checkout__input--accountConsentCheckbox');

const holderName = Selector('.adyen-checkout__bacs-input--holder-name');
const nonEditableHolderName = holderName.withAttribute('readonly');
const editButton = Selector('.adyen-checkout__bacs--edit-button');
const payButton = Selector('.adyen-checkout__bacs .adyen-checkout__button--pay');
const validTicks = Selector('.adyen-checkout-input__inline-validation--valid');

const voucher = Selector('.adyen-checkout__voucher-result--directdebit_GB');
const voucherButton = Selector('.adyen-checkout__voucher-result--directdebit_GB .adyen-checkout__button--action');

const TEST_SPEED = 0.8;

fixture`Testing BacsDD in dropin`.page(BASE_URL + '?countryCode=GB').clientScripts('bacs.clientScripts.js');
// todo: migrate to playwright
test('Fill in Bacs details, check "Edit" phase and then complete payment', async t => {
    // Start, allow time to load
    await start(t, 2000, TEST_SPEED);

    await t
        // Select Bacs PM
        .click('.adyen-checkout__payment-method--directdebit_GB')

        /**
         * Fill phase 1 form
         */
        // Check holderName doesn't have a readonly attribute
        .expect(nonEditableHolderName.exists)
        .notOk()

        // Fill fields
        .typeText(holderName, 'S Dooley')
        .typeText('.adyen-checkout__bacs--bank-account-number', '40308669')
        .typeText('.adyen-checkout__bacs--bank-location-id', '560036')
        .typeText('.adyen-checkout__bacs-input--shopper-email', 'da@ddog.co.uk')

        // Expect to see green "valid" ticks
        .expect(validTicks.filterVisible().exists)
        .ok()

        // Click Pay
        .click(payButton)
        // Expect errors
        .expect(Selector('.adyen-checkout__field--error').exists)
        .ok()

        // Click checkboxes (in reality click their labels - for some reason clicking the actual checkboxes takes ages)
        .click(checkboxLabel.nth(0))
        //                .expect(checkboxAmount.checked).ok()
        .click(checkboxLabel.nth(1))
        //        .expect(checkboxAccount.checked).ok()

        // Click Pay
        .click(payButton)
        // Expect no errors
        .expect(Selector('.adyen-checkout__field--error').exists)
        .notOk()

        // Expect dropin to be valid
        .expect(getIsValid('dropin'))
        .eql(true)

        /**
         * Form in phase 2
         */
        // Check holderName is now readonly
        .expect(nonEditableHolderName.exists)
        .ok()

        // Expect not to see green "valid" ticks (should be display:none)
        .expect(validTicks.filterHidden().exists)
        .ok()

        // Check we now have an Edit button
        .expect(editButton.exists)
        .ok()

        // Click Edit
        .click(editButton)

        /**
         * Form in phase 1 again
         */
        // Check holderName doesn't have a readonly attribute
        .expect(nonEditableHolderName.exists)
        .notOk()

        // Change holder name
        .typeText(holderName, 'David Archer', { replace: true })

        // Click Pay
        .click(payButton)

        /**
         * Form in phase 2 again
         */
        // Click Pay
        .click(payButton)

        /**
         * Final phase: voucher action has been handled
         */
        .wait(3000)
        .expect(voucher.exists)
        .ok()
        .expect(voucherButton.exists)
        .ok();
});
