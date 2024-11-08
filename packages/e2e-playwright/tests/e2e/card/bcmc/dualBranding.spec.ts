import { test } from '@playwright/test';

test.describe('Bcmc payments with dual branding', () => {
    test.describe('Selecting the Bancontact brand', () => {
        test('should submit the bcmc payment', async () => {
            // should see the bcmc logo on init
            // fill in dual brand card maestro
            // expect to see 2 logos with correct order
            // select bcmc logo
            // expect to see the bcmc logo highlighted
            // click pay btn
            // expect to see success msg
        });

        test('should not submit the bcmc payment with incomplete form data', async () => {
            // should see the bcmc logo on init
            // do not fill the expiry date
            // should see error msg
        });

        test('should not submit the bcmc payment with invalid bcmc card number', async () => {
            // should see the bcmc logo on init
            // do not fill the expiry date
            // should see error msg
        });
    });

    test.describe('Selecting the maestro brand', () => {
        test('should submit the maestro payment', async () => {
            // should see the bcmc logo on init
            // fill in dual brand card maestro
            // expect to see 2 logos with correct order
            // select maestro logo
            // expect to see the maestro logo highlighted
            // click pay btn
            // expect to see success msg
        });
        test('should not submit the maestro payment with incomplete form data', async () => {
            // should see the bcmc logo on init
            // do not fill the expiry date
            // should see error msg
        });

        test('should not submit the maestro payment with invalid maestro card number', async () => {
            // should see the bcmc logo on init
            // wrong maestro card number
            // should see error msg
        });
    });

    test.describe('Selecting the visa brand', () => {
        test('should submit the visa payment', async () => {
            // should see the bcmc logo on init
            // fill in dual brand card visa
            // expect to see 2 logos with correct order
            // select visa logo
            // expect to see the visa logo highlighted
            // fill in the rest required fields
            // click pay btn
            // expect to see success msg
        });

        test('should not submit the visa payment with incomplete form data', async () => {
            // should see the bcmc logo on init
            // do not fill the expiry date
            // should see error msg
        });

        test('should not submit the visa payment with invalid visa card number', async () => {
            // should see the bcmc logo on init
            // wrong maestro card number
            // should see error msg
        });
    });

    test.describe('Selecting the mc brand', () => {
        test('should submit the mc payment', async () => {
            // should see the bcmc logo on init
            // fill in dual brand card mc
            // expect to see 2 logos with correct order
            // select mc logo
            // expect to see the mc logo highlighted
            // fill in the rest required fields
            // click pay btn
            // expect to see success msg
        });

        test('should not submit the mc payment with incomplete form data', async () => {});

        test('should not submit the mc payment with invalid mc card number', async () => {});
    });
});
