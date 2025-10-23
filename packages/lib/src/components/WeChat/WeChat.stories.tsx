import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { QRLoaderConfiguration } from '../types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import WeChat from './WeChat';

type WeChatStory = StoryConfiguration<QRLoaderConfiguration>;

const meta: MetaConfiguration<QRLoaderConfiguration> = {
    title: 'Components/WeChat'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<QRLoaderConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new WeChat(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: WeChatStory = {
    render,
    args: {
        countryCode: 'CN'
    }
};

export default meta;
