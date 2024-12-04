import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../types';
import { FastlaneInSinglePageApp } from './FastlaneInSinglePageApp';
import { ComponentContainer } from '../../ComponentContainer';

import Dropin from '../../../../src/components/Dropin/Dropin';
import Card from '../../../../src/components/Card/Card';
import PayPal from '../../../../src/components/PayPal/Paypal';
import Fastlane from '../../../../src/components/PayPalFastlane';
import { Checkout } from '../../Checkout';

type FastlaneStory = StoryConfiguration<{}>;

const meta: MetaConfiguration<FastlaneStory> = {
    title: 'Wallets/Fastlane'
};

export const Default: FastlaneStory = {
    render: checkoutConfig => {
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

        return <FastlaneInSinglePageApp checkoutConfig={{ paymentMethodsOverride, ...checkoutConfig }} />;
    }
};

export const WithMockedRecognizedFlow: FastlaneStory = {
    render: checkoutConfig => {
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

        return (
            <Checkout checkoutConfig={{ ...checkoutConfig, paymentMethodsOverride }}>
                {checkout => (
                    <ComponentContainer
                        element={
                            new Dropin(checkout, {
                                showStoredPaymentMethods: false,
                                paymentMethodComponents: [Card, PayPal, Fastlane],
                                paymentMethodsConfiguration: {
                                    fastlane: {
                                        tokenId: 'xxx',
                                        customerId: 'sss',
                                        lastFour: '1111',
                                        brand: 'visa',
                                        email: 'email@adyen.com',
                                        fastlaneSessionId: 'xxx'
                                    }
                                }
                            })
                        }
                    />
                )}
            </Checkout>
        );
    }
};

export default meta;
