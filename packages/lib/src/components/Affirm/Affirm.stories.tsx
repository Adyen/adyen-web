import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import Affirm from './Affirm';
import { OpenInvoiceConfiguration } from '../types';

type AffirmStory = StoryConfiguration<OpenInvoiceConfiguration>;

const meta: MetaConfiguration<OpenInvoiceConfiguration> = {
    title: 'Components/Affirm'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<OpenInvoiceConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new Affirm(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: AffirmStory = {
    render,
    args: {
        countryCode: 'US'
    }
};

export default meta;
