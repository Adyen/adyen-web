import './main.css';
import '@adyen/adyen-web/dist/es/adyen.css';
import { Preview } from '@storybook/html';
import { DEFAULT_COUNTRY_CODE, DEFAULT_SHOPPER_LOCALE, DEFAULT_AMOUNT_VALUE } from '../config/commonConfig';
import { createCheckout } from '../helpers/create-checkout';

const preview: Preview = {
    argTypes: {
        useSessions: {
            control: 'boolean'
        },
        countryCode: {
            control: 'text'
        },
        shopperLocale: {
            control: 'text'
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
    loaders: [
        async context => {
            const checkout = await createCheckout(context);
            return { checkout };
        }
    ],
    decorators: [
        story => {
            const tale = story();
            const wrapper = document.createElement('div');
            wrapper.className = 'component-wrapper';
            wrapper.id = 'component-field';
            // @ts-ignore
            wrapper.appendChild(tale);
            return wrapper;
        }
    ]
};

export default preview;
