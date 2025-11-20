import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import MBWay from './MBWay';
import { AwaitConfiguration } from '../types';

type MBWayStory = StoryConfiguration<AwaitConfiguration>;

const meta: MetaConfiguration<AwaitConfiguration> = {
    title: 'Components/MBWay'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<AwaitConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new MBWay(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: MBWayStory = {
    render,
    args: {
        countryCode: 'PT'
    }
};

export default meta;
