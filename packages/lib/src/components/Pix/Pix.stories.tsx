import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { PixConfiguration } from './types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import Pix from './Pix';

type PixStory = StoryConfiguration<PixConfiguration>;

const meta: MetaConfiguration<PixConfiguration> = {
    title: 'Components/Pix'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<PixConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new Pix(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: PixStory = {
    render,
    args: {
        countryCode: 'BR'
    }
};

export const WithPersonalDetails: PixStory = {
    render,
    args: {
        countryCode: 'BR',
        componentConfiguration: {
            personalDetailsRequired: true
        }
    }
};

export default meta;
