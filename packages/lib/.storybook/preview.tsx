import './main.css';
import { h, Fragment } from 'preact';
import { Preview } from '@storybook/preact-vite';
import { SRPanelDebugger } from '../storybook/components/SRPanelDebugger';
import { DEFAULT_COUNTRY_CODE, DEFAULT_SHOPPER_LOCALE, DEFAULT_AMOUNT_VALUE, SHOPPER_LOCALES } from '../storybook/config/commonConfig';
import { setupWorker } from 'msw/browser';
import { mswLoader } from 'msw-storybook-addon/csf3';
import { COUNTRY_CODES } from '../storybook/constants/countries';

/*
 * The configurations in this file run on runtime
 * Any environment variable set in the .env file is available here via define Vite config in main.ts
 */

// we expect this to be formatted as a string in main.tsx
const disableMsw = process.env.DISABLE_MSW === 'true';

let loaders = {};

if (!disableMsw) {
    loaders = {
        loaders: [
            mswLoader(async () => {
                const worker = setupWorker();
                await worker.start({ onUnhandledRequest: 'bypass' });

                return worker;
            })
        ]
    };
}

const preview: Preview = {
    globalTypes: {
        srPanelDebugger: {
            description: 'Log every screen reader panel mutation and setMessages call on screen',
            toolbar: {
                title: 'SR panel debugger',
                icon: 'accessibility',
                items: [
                    { value: false, title: 'SR debugger: off' },
                    { value: true, title: 'SR debugger: on' }
                ],
                dynamicTitle: true
            }
        }
    },
    initialGlobals: {
        srPanelDebugger: false
    },
    decorators: [
        (Story, context) => (
            <Fragment>
                <Story />
                {context.globals.srPanelDebugger && <SRPanelDebugger />}
            </Fragment>
        )
    ],
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
        },
        'srConfig.showPanel': {
            control: 'boolean'
        }
    },
    args: {
        useSessions: true,
        countryCode: DEFAULT_COUNTRY_CODE,
        shopperLocale: DEFAULT_SHOPPER_LOCALE,
        amount: DEFAULT_AMOUNT_VALUE,
        showPayButton: true,
        'srConfig.showPanel': false
    },
    parameters: {
        options: {
            storySort: {
                order: [
                    'Welcome',
                    'Drop-in',
                    'Components',
                    ['Cards', ['Card', '*'], 'Wallets', 'IssuerList', 'OpenInvoice', 'Vouchers', 'Gift Cards', 'Redirect', '*'],
                    'Internal Elements',
                    '*'
                ]
            }
        }
    },
    ...loaders
};

export default preview;
