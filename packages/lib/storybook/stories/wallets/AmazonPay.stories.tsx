import { MetaConfiguration, StoryConfiguration } from '../types';
import { ApplePayConfiguration } from '../../../src/components/ApplePay/types';
import { AmazonPayConfiguration } from '../../../src/components/AmazonPay/types';
import { AmazonPayExample } from './AmazonPayExample';

type AmazonPayStory = StoryConfiguration<AmazonPayConfiguration>;

const meta: MetaConfiguration<ApplePayConfiguration> = {
    title: 'Wallets/AmazonPay'
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
