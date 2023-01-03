import '!style-loader!css-loader!./main.css';
import '!style-loader!css-loader!@adyen/adyen-web/dist/es/adyen.css';
import { countryCode, shopperLocale } from '../config/commonConfig';

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
        defaultValue: countryCode,
        control: 'text'
    },
    shopperLocale: {
        defaultValue: shopperLocale,
        control: 'text'
    },
    amount: {
        defaultValue: 25900,
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

        if (typeof tale === 'string') {
            return `<div id='component-field' class="component-wrapper">${story}</div>`;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'component-wrapper';
        wrapper.id = 'component-field';
        wrapper.appendChild(tale);
        return wrapper;
    }
];
