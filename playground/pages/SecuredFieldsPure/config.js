// GLOBALS
window._b$dl = false;
window.type = null;
window.rootNode = null;
window.hideCVC = false;
window.cardBrand = null;

// QUICK WAY TO SHOW OR HIDE SF EXAMPLES
export const showCard = true;
export const showKCPCard = true;
export const showStoredCard = true;
export const showACH = true;
export const showGiftCard = true;
export const showSepa = true;

/**
 * Steps to make payment (against http://localhost:8080/backoffice):
 *  - Got to TestMerchant WS user at http://localhost:8080/backoffice/
 *  - Generate originKey for http://localhost:8011 (or whichever IP address you are running this code at)
 *  - Paste originKey into originKeyMain property below
 *  - Access the CSE file (from backoffice go to the library location for the "Hosted Client-Side Encryption") and copy the public key from near the bottom of the file
 *  - Paste the public key into the corresponding position in the local temp CSE file e.g. tempCse_v24_expanded_noDf_noPlugins.js
 *  - Paste the publicKeyToken section of the originKey into the top of the local temp CSE file
 */

/**
 * SecuredFields from localhost:8011
 * - needs SF_ENV set in Components
 * - .env setup for local (or test)
 * - below settings will make payment when tempCse_v24_...js has correct key & token from localhost:8080
 */
export const originKeyMain = 'N/A'; // Doesn't actually matter - since we hardcode the origin in the localhost:8011 securedFields file
export const loadingContextMain = 'http://localhost:8011/';
export const paymentsURL = 'http://localhost:8011/payments';

/**
 * SecuredFields from localhost:8080 (backoffice)
 * - NO SF_ENV set in Components
 * - .env setup for local (or test)
 */
//export const originKeyMain = 'pub.v2.9915834835780790.aHR0cDovL2xvY2FsaG9zdDozMDIw.SXD6QhfK6HzqFxU95FkUlweUv6_r5IVDoNDpXZGcbj4';//3020
//export const loadingContextMain = 'http://localhost:8080/checkoutshopper/';
//const paymentsURL = 'http://localhost:8011/payments';

/**
 * SecuredFields from Test server
 * - NO SF_ENV set in Components
 * - .env setup for test
 */
//export const originKeyMain = 'pub.v2.8714289145368445.aHR0cDovL2xvY2FsaG9zdDozMDIw.gQ1Kiz6ONmR6PekFDfFtUL4UoXBLq-S_pD-uKggE-9s';//Test
//export const loadingContextMain = 'https://checkoutshopper-test.adyen.com/checkoutshopper/';
//const paymentsURL = 'http://localhost:3020/payments';

// IE - Needs retested
// export const loadingContextMain = 'http://172.17.126.252:8011/';// works across localhost & IE VM - but not offline
