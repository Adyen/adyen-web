import { ClientFunction } from 'testcafe';

const getCheckoutAttemptIdFromSessionStorage = ClientFunction(() => JSON.parse(sessionStorage.getItem('adyen-checkout__checkout-attempt-id')));

export { getCheckoutAttemptIdFromSessionStorage };
