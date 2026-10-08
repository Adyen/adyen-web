import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { OpenInvoiceConfiguration } from '../types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { FacilPay10x as FacilyPay10x } from '@adyen/adyen-web';
import { Checkout } from '../../../storybook/components/Checkout';

type FacilyPay10xStory = StoryConfiguration<OpenInvoiceConfiguration>;

const meta: MetaConfiguration<OpenInvoiceConfiguration> = {
    title: 'Components/OpenInvoice/FacilyPay10x'
};

export const Default: FacilyPay10xStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new FacilyPay10x(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'FR'
    }
};

export default meta;
