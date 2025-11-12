import './main.css';
import { Preview } from '@storybook/preact';
import { DEFAULT_COUNTRY_CODE, DEFAULT_SHOPPER_LOCALE, DEFAULT_AMOUNT_VALUE, SHOPPER_LOCALES } from '../storybook/config/commonConfig';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { COUNTRY_CODES } from '../storybook/constants/countries';

/*
 * The configurations in this file run on runtime
 * Any environment variable set in the .env file is available here via define Vite config in main.ts
 */

// we expect this to be formatted as a string in main.tsx
const disableMsw = process.env.DISABLE_MSW === 'true';

let loaders = {};

if (!disableMsw) {
    initialize({ onUnhandledRequest: 'bypass' });
    loaders = { loaders: [mswLoader] };
}

const preview: Preview = {
    argTypes: {
        useSessions: {
            control: 'boolean'
        },
        countryCode: {
            control: 'select',
            options: Object.values(COUNTRY_CODES)
        },
        shopperLocale: {
            control: 'select',
            options: SHOPPER_LOCALES
        },
        amount: {
            control: 'number'
        },
        showPayButton: {
            control: 'boolean'
        }
    },
    args: {
        useSessions: true,
        countryCode: DEFAULT_COUNTRY_CODE,
        shopperLocale: DEFAULT_SHOPPER_LOCALE,
        amount: DEFAULT_AMOUNT_VALUE,
        showPayButton: true
    },
    parameters: {
        options: {
            storySort: {
                order: [
                    'Welcome',
                    'Dropin',
                    'Components',
                    ['Cards', ['Card', '*'], 'Wallets', 'IssuerList', 'OpenInvoice', 'Partial Payments', 'Vouchers', 'Redirect', '*'],
                    'Internal Elements',
                    '*'
                ]
            }
        }
    },
    ...loaders
};

export default preview;
