import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import DuitNow from './DuitNow';
import { QRLoaderConfiguration } from '../types';

type DuitNowStory = StoryConfiguration<QRLoaderConfiguration>;

const meta: MetaConfiguration<QRLoaderConfiguration> = {
    title: 'Components/DuitNow'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<QRLoaderConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new DuitNow(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: DuitNowStory = {
    render,
    args: {
        countryCode: 'MY'
    }
};

export default meta;
