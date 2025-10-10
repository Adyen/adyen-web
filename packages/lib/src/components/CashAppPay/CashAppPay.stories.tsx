import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { CashAppPayConfiguration } from './types';
import CashAppPay from './CashAppPay';
import { Checkout } from '../../../storybook/components/Checkout';

type CashAppPayStory = StoryConfiguration<CashAppPayConfiguration>;

const meta: MetaConfiguration<CashAppPayConfiguration> = {
    title: 'Components/Wallets/CashAppPay'
};

export const Default: CashAppPayStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new CashAppPay(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'US'
    }
};

export default meta;
