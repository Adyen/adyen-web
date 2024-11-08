import { test } from '@playwright/test';

test('should make a bacs direct debit payment', async () => {
    // fill in the info
    // no further edit
});

test('should make a bacs direct debit payment by filling in Bacs details, check "Edit" phase and then complete payment', async () => {
    // fill in the info
    // Start, allow time to load
    // await start(t, 2000, TEST_SPEED);
    //
    // await t
    //   // Select Bacs PM
    //   .click('.adyen-checkout__payment-method--directdebit_GB')
    //
    //   /**
    //    * Fill phase 1 form
    //    */
    //   // Check holderName doesn't have a readonly attribute
    //   .expect(nonEditableHolderName.exists)
    //   .notOk()
    //
    //   // Fill fields
    //   .typeText(holderName, 'S Dooley')
    //   .typeText('.adyen-checkout__bacs--bank-account-number', '40308669')
    //   .typeText('.adyen-checkout__bacs--bank-location-id', '560036')
    //   .typeText('.adyen-checkout__bacs-input--shopper-email', 'da@ddog.co.uk')
    //
    //   // Expect to see green "valid" ticks
    //   .expect(validTicks.filterVisible().exists)
    //   .ok()
    //
    //   // Click Pay
    //   .click(payButton)
    //   // Expect errors
    //   .expect(Selector('.adyen-checkout__field--error').exists)
    //   .ok()
    //
    //   // Click checkboxes (in reality click their labels - for some reason clicking the actual checkboxes takes ages)
    //   .click(checkboxLabel.nth(0))
    //   //                .expect(checkboxAmount.checked).ok()
    //   .click(checkboxLabel.nth(1))
    //   //        .expect(checkboxAccount.checked).ok()
    //
    //   // Click Pay
    //   .click(payButton)
    //   // Expect no errors
    //   .expect(Selector('.adyen-checkout__field--error').exists)
    //   .notOk()
    //
    //   // Expect dropin to be valid
    //   .expect(getIsValid('dropin'))
    //   .eql(true)
    //
    //   /**
    //    * Form in phase 2
    //    */
    //   // Check holderName is now readonly
    //   .expect(nonEditableHolderName.exists)
    //   .ok()
    //
    //   // Expect not to see green "valid" ticks (should be display:none)
    //   .expect(validTicks.filterHidden().exists)
    //   .ok()
    //
    //   // Check we now have an Edit button
    //   .expect(editButton.exists)
    //   .ok()
    //
    //   // Click Edit
    //   .click(editButton)
    //
    //   /**
    //    * Form in phase 1 again
    //    */
    //   // Check holderName doesn't have a readonly attribute
    //   .expect(nonEditableHolderName.exists)
    //   .notOk()
    //
    //   // Change holder name
    //   .typeText(holderName, 'David Archer', { replace: true })
    //
    //   // Click Pay
    //   .click(payButton)
    //
    //   /**
    //    * Form in phase 2 again
    //    */
    //   // Click Pay
    //   .click(payButton)
    //
    //   /**
    //    * Final phase: voucher action has been handled
    //    */
    //   .wait(3000)
    //   .expect(voucher.exists)
    //   .ok()
    //   .expect(voucherButton.exists)
    //   .ok();
    // edit
});
test('should not submit the bacs direct debit payment due to wrong email', async () => {
    // wrong email
});
test('should not submit the bacs direct debit payment due to not check the consent checkbox', async () => {
    // not check the consent
});
