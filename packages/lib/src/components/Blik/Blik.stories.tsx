import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import Blik from './Blik';
import { AwaitConfiguration } from '../types';

type BlikStory = StoryConfiguration<AwaitConfiguration>;

const meta: MetaConfiguration<AwaitConfiguration> = {
    title: 'Components/Blik'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<AwaitConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new Blik(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: BlikStory = {
    render,
    args: {
        countryCode: 'PL'
    }
};

export default meta;
