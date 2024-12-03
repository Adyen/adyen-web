import { MetaConfiguration, StoryConfiguration } from '../../types';
import { FastlaneInSinglePageApp } from './FastlaneInSinglePageApp';

type FastlaneStory = StoryConfiguration<{}>;

const meta: MetaConfiguration<FastlaneStory> = {
    title: 'Wallets/Fastlane'
};

export const Default: FastlaneStory = {
    render: checkoutConfig => {
        const allowedPaymentTypes = ['scheme', 'paypal', 'fastlane'];

        const paymentMethodsOverride = {
            paymentMethods: [
                {
                    type: 'scheme',
                    name: 'Card',
                    brands: ['mc', 'visa']
                },
                {
                    configuration: { merchantId: 'QSXMR9W7GV8NY', intent: 'capture' },
                    name: 'PayPal',
                    type: 'paypal'
                },
                {
                    name: 'Fastlane',
                    type: 'fastlane',
                    brands: ['mc', 'visa']
                }
            ]
        };

        return <FastlaneInSinglePageApp checkoutConfig={{ allowedPaymentTypes, paymentMethodsOverride, ...checkoutConfig }} />;
    }
};

export default meta;
