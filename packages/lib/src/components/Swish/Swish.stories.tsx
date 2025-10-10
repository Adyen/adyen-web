import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { QRLoaderConfiguration } from '../../types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import Swish from '.';

type SwishStory = StoryConfiguration<QRLoaderConfiguration>;

const meta: MetaConfiguration<QRLoaderConfiguration> = {
    title: 'Components/Swish'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<QRLoaderConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new Swish(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: SwishStory = {
    render,
    args: {
        countryCode: 'SE'
    }
};

export default meta;
