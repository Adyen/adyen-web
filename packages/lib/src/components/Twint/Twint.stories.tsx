import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { RedirectConfiguration } from '../types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import Twint from './Twint';

type TwintStory = StoryConfiguration<RedirectConfiguration>;

const meta: MetaConfiguration<RedirectConfiguration> = {
    title: 'Components/Twint'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<RedirectConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new Twint(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: TwintStory = {
    render,
    args: {
        countryCode: 'CH'
    }
};

export default meta;
