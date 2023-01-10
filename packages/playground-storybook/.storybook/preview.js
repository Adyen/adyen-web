import '!style-loader!css-loader!./main.css';
import '!style-loader!css-loader!@adyen/adyen-web/dist/es/adyen.css';
import { DEFAULT_COUNTRY_CODE, DEFAULT_SHOPPER_LOCALE, DEFAULT_AMOUNT_VALUE } from '../config/commonConfig';

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/
        }
    }
};

/**
 * https://storybook.js.org/docs/html/api/argtypes
 * https://storybook.js.org/docs/html/essentials/controls
 */
export const argTypes = {
    useSessions: {
        defaultValue: 'true',
        control: 'boolean'
    },
    countryCode: {
        defaultValue: DEFAULT_COUNTRY_CODE,
        control: 'text'
    },
    shopperLocale: {
        defaultValue: DEFAULT_SHOPPER_LOCALE,
        control: 'text'
    },
    amount: {
        defaultValue: DEFAULT_AMOUNT_VALUE,
        control: 'number'
    },
    showPayButton: {
        defaultValue: 'true',
        control: 'boolean'
    }
};

export const decorators = [
    story => {
        const tale = story();

        const wrapper = document.createElement('div');
        wrapper.className = 'component-wrapper';
        wrapper.id = 'component-field';
        wrapper.appendChild(tale);
        return wrapper;
    }
];
