import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { RedirectConfiguration } from '../types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import Vipps from './Vipps';

type VippsStory = StoryConfiguration<RedirectConfiguration>;

const meta: MetaConfiguration<RedirectConfiguration> = {
    title: 'Components/Vipps'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<RedirectConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new Vipps(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: VippsStory = {
    render,
    args: {
        countryCode: 'NO'
    }
};

export default meta;
