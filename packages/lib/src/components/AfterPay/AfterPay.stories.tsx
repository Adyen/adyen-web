import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { OpenInvoiceConfiguration } from '../types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import AfterPay from './AfterPay';
import { Checkout } from '../../../storybook/components/Checkout';

console.log(manny);

type AfterPayStory = StoryConfiguration<OpenInvoiceConfiguration>;

const meta: MetaConfiguration<OpenInvoiceConfiguration> = {
    title: 'Components/OpenInvoice/AfterPay'
};

export const Default: AfterPayStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new AfterPay(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'NL'
    }
};

export default meta;
