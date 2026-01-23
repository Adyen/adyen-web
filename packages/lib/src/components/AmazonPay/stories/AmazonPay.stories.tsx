import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../../storybook/types';
import { ApplePayConfiguration } from '../../ApplePay/types';
import { AmazonPayConfiguration } from '../types';
import { AmazonPayExample } from './AmazonPayExample';

type AmazonPayStory = StoryConfiguration<AmazonPayConfiguration>;

const meta: MetaConfiguration<ApplePayConfiguration> = {
    title: 'Components/Wallets/AmazonPay',
    tags: ['no-automated-visual-test']
};

export const Default: AmazonPayStory = {
    render: args => {
        return <AmazonPayExample contextArgs={args} />;
    },
    args: {
        countryCode: 'GB'
    }
};
export default meta;
