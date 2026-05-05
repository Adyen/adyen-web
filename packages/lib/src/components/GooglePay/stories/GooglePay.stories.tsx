import { h } from 'preact';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import GooglePay from '../GooglePay';
import { Checkout } from '../../../../storybook/components/Checkout';
import { GooglePayExpressDemo } from './GooglePayExpressDemo';
import { GooglePayExpressSessionsDemo } from './GooglePayExpressSessionsDemo';
import { EXPRESS_DEMO_SETTINGS } from './googlePayExpressUtils';

import type { MetaConfiguration, StoryConfiguration } from '../../../../storybook/types';
import type { GooglePayConfiguration } from '../types';

type GooglePayStory = StoryConfiguration<GooglePayConfiguration>;

const meta: MetaConfiguration<GooglePayConfiguration> = {
    title: 'Components/Wallets/GooglePay',
    tags: ['no-automated-visual-test']
};

export const Default: GooglePayStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new GooglePay(checkout, componentConfiguration)} />}
        </Checkout>
    ),

    args: {
        countryCode: 'BR',
        componentConfiguration: {
            buttonColor: 'black',
            buttonType: 'buy',
            buttonSizeMode: 'fill',
            buttonRadius: 0
        }
    }
};

export const ExpressOnAdvanced: GooglePayStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>{checkout => <GooglePayExpressDemo checkout={checkout} />}</Checkout>
    ),
    parameters: {
        controls: { exclude: ['useSessions', 'shopperLocale', 'amount', 'showPayButton', 'countryCode', 'srConfig.showPanel'] }
    },
    args: {
        countryCode: EXPRESS_DEMO_SETTINGS.COUNTRY_CODE,
        amount: EXPRESS_DEMO_SETTINGS.INITIAL_AMOUNT,
        shopperLocale: EXPRESS_DEMO_SETTINGS.SHOPPER_LOCALE
    }
};

export const ExpressOnSessions: GooglePayStory = {
    render: checkoutConfig => {
        const { amount, countryCode, shopperLocale } = checkoutConfig;
        return <GooglePayExpressSessionsDemo amount={amount} countryCode={countryCode} shopperLocale={shopperLocale} />;
    },
    parameters: {
        controls: { exclude: ['useSessions', 'shopperLocale', 'amount', 'showPayButton', 'countryCode', 'srConfig.showPanel'] }
    },
    args: {
        countryCode: EXPRESS_DEMO_SETTINGS.COUNTRY_CODE,
        amount: EXPRESS_DEMO_SETTINGS.INITIAL_AMOUNT,
        shopperLocale: EXPRESS_DEMO_SETTINGS.SHOPPER_LOCALE
    }
};

export default meta;
