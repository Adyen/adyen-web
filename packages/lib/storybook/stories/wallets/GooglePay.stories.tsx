import { MetaConfiguration, StoryConfiguration } from '../types';
import { ComponentContainer } from '../ComponentContainer';
import { GooglePayConfiguration } from '../../../src/components/GooglePay/types';
import GooglePay from '../../../src/components/GooglePay';
import { Checkout } from '../Checkout';

type GooglePayStory = StoryConfiguration<GooglePayConfiguration>;

const meta: MetaConfiguration<GooglePayConfiguration> = {
    title: 'Wallets/GooglePay'
};

export const Default: GooglePayStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new GooglePay(checkout, componentConfiguration)} />}
        </Checkout>
    )
};

export default meta;
