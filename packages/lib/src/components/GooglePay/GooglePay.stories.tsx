import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { GooglePayConfiguration } from './types';
import GooglePay from './GooglePay';
import { Checkout } from '../../../storybook/components/Checkout';

type GooglePayStory = StoryConfiguration<GooglePayConfiguration>;

const meta: MetaConfiguration<GooglePayConfiguration> = {
    title: 'Components/Wallets/GooglePay'
};

export const Default: GooglePayStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new GooglePay(checkout, componentConfiguration)} />}
        </Checkout>
    ),

    args: {
        componentConfiguration: {
            buttonColor: 'black',
            buttonType: 'buy',
            buttonSizeMode: 'fill',
            buttonRadius: 0
        }
    }
};

export default meta;
