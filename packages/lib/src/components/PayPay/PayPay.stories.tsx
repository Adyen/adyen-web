import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { PayPayConfiguration } from './types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import PayPay from './PayPay';

type PayPayStory = StoryConfiguration<PayPayConfiguration>;

const meta: MetaConfiguration<PayPayConfiguration> = {
    title: 'Components/PayPay'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<PayPayConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new PayPay(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: PayPayStory = {
    render,
    args: {
        countryCode: 'JP'
    }
};

export default meta;
