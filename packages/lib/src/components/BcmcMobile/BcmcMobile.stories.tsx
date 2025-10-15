import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { QRLoaderConfiguration } from '../../types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import BcmcMobile from './BcmcMobile';

type PayconicStory = StoryConfiguration<QRLoaderConfiguration>;

const meta: MetaConfiguration<QRLoaderConfiguration> = {
    title: 'Components/BcmcMobile'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<QRLoaderConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>
        {checkout => <ComponentContainer element={new BcmcMobile(checkout, componentConfiguration)} />}
    </Checkout>
);

export const Default: PayconicStory = {
    render,
    args: {
        countryCode: 'BE'
    }
};

export default meta;
