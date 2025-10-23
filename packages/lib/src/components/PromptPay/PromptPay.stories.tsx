import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { QRLoaderConfiguration } from '../../types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import PromptPay from './PromptPay';

type PromptPayStory = StoryConfiguration<QRLoaderConfiguration>;

const meta: MetaConfiguration<QRLoaderConfiguration> = {
    title: 'Components/PromptPay'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<QRLoaderConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>
        {checkout => <ComponentContainer element={new PromptPay(checkout, componentConfiguration)} />}
    </Checkout>
);

export const Default: PromptPayStory = {
    render,
    args: {
        countryCode: 'TH'
    }
};

export default meta;
