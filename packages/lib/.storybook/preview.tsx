import './main.css';
import '../storybook/stories/dropin/customization.scss';
import { Preview } from '@storybook/preact';
import { DEFAULT_COUNTRY_CODE, DEFAULT_SHOPPER_LOCALE, DEFAULT_AMOUNT_VALUE } from '../storybook/config/commonConfig';
import { createCheckout } from '../storybook/helpers/create-checkout';

const preview: Preview = {
    argTypes: {
        useSessions: {
            control: 'boolean',
            description: 'Should use sessions or not',
            defaultValue: 'false'
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
            if (context.componentId.includes('redirectresult')) {
                return {};
            }
            const checkout = await createCheckout(context);
            return { checkout };
        }
    ]
};

export default preview;
