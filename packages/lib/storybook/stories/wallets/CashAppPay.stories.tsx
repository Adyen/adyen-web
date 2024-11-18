import { MetaConfiguration, StoryConfiguration } from '../types';
import { ComponentContainer } from '../ComponentContainer';
import { CashAppPayConfiguration } from '../../../src/components/CashAppPay/types';
import CashAppPay from '../../../src/components/CashAppPay/CashAppPay';
import { Checkout } from '../Checkout';

type CashAppPayStory = StoryConfiguration<CashAppPayConfiguration>;

const meta: MetaConfiguration<CashAppPayConfiguration> = {
    title: 'Wallets/CashAppPay'
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
