import './main.css';
import { Preview } from '@storybook/preact';
import { DEFAULT_COUNTRY_CODE, DEFAULT_SHOPPER_LOCALE, DEFAULT_AMOUNT_VALUE, SHOPPER_LOCALES } from '../storybook/config/commonConfig';
import { initialize, mswLoader } from 'msw-storybook-addon';

/*
 * The configurations in this file run on runtime
 * Any environment variable set in the .env file is available here via define Vite config in main.ts
 */

// we expect this to be formatted as a string in main.tsx
const disableMsw = 'true';

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
            control: 'text'
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
    ...loaders
};

export default preview;
