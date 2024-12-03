import { MetaConfiguration, StoryConfiguration } from '../../types';
import { FastlaneInSinglePageApp } from './FastlaneInSinglePageApp';

type FastlaneStory = StoryConfiguration<{}>;

const meta: MetaConfiguration<FastlaneStory> = {
    title: 'Wallets/Fastlane'
};

export const Default: FastlaneStory = {
    render: checkoutConfig => {
        const allowedPaymentTypes = ['scheme', 'paypal'];
        return <FastlaneInSinglePageApp checkoutConfig={{ allowedPaymentTypes, ...checkoutConfig }} />;
    }
};

export default meta;
