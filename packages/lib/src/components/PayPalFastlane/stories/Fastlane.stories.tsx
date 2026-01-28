import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../../storybook/types';
import { FastlaneInSinglePageApp } from './FastlaneInSinglePageApp';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';

import Dropin from '../../Dropin/Dropin';
import Card from '../../Card/Card';
import PayPal from '../../PayPal/Paypal';
import Fastlane from '../Fastlane';
import { Checkout } from '../../../../storybook/components/Checkout';

type FastlaneStory = StoryConfiguration<{}>;

const meta: MetaConfiguration<FastlaneStory> = {
    title: 'Components/Wallets/Fastlane',
    tags: ['no-automated-visual-test']
};

export const Lookup: FastlaneStory = {
    render: checkoutConfig => {
        const paymentMethodsOverride = {
            paymentMethods: [
                {
                    type: 'scheme',
                    name: 'Cards',
                    brands: ['mc', 'visa']
                },
                {
                    configuration: { merchantId: 'QSXMR9W7GV8NY', intent: 'capture' },
                    name: 'PayPal',
                    type: 'paypal'
                },
                {
                    name: 'Cards',
                    type: 'fastlane',
                    brands: ['mc', 'visa']
                }
            ]
        };

        return <FastlaneInSinglePageApp checkoutConfig={{ paymentMethodsOverride, ...checkoutConfig }} />;
    }
};

export const MockedUnrecognizedFlowDropin: FastlaneStory = {
    render: checkoutConfig => {
        const paymentMethodsOverride = {
            paymentMethods: [
                {
                    type: 'scheme',
                    name: 'Cards',
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
                                onSubmit(state, component, actions) {
                                    actions.resolve({
                                        resultCode: 'Authorised'
                                    });
                                },
                                paymentMethodComponents: [Card],
                                paymentMethodsConfiguration: {
                                    card: {
                                        fastlaneConfiguration: {
                                            showConsent: true,
                                            defaultToggleState: true,
                                            termsAndConditionsLink: 'https://adyen.com',
                                            privacyPolicyLink: 'https://adyen.com',
                                            termsAndConditionsVersion: 'v1',
                                            fastlaneSessionId: 'ABC-123',
                                            telephoneNumber: '1234567890'
                                        }
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

export const MockedRecognizedFlowDropin: FastlaneStory = {
    render: checkoutConfig => {
        const paymentMethodsOverride = {
            paymentMethods: [
                {
                    type: 'scheme',
                    name: 'Cards',
                    brands: ['mc', 'visa']
                },
                {
                    configuration: { merchantId: 'QSXMR9W7GV8NY', intent: 'capture' },
                    name: 'PayPal',
                    type: 'paypal'
                },
                {
                    name: 'Cards',
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
                                onSubmit(state, component, actions) {
                                    actions.resolve({
                                        resultCode: 'Authorised'
                                    });
                                },
                                showStoredPaymentMethods: false,
                                paymentMethodComponents: [Card, PayPal, Fastlane],
                                paymentMethodsConfiguration: {
                                    fastlane: {
                                        tokenId: 'xxx',
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

export const MockedRecognizedFlowStandalone: FastlaneStory = {
    render: checkoutConfig => {
        const paymentMethodsOverride = {
            paymentMethods: [
                {
                    type: 'scheme',
                    name: 'Cards',
                    brands: ['mc', 'visa']
                },
                {
                    name: 'Cards',
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
                            new Fastlane(checkout, {
                                onSubmit(state, component, actions) {
                                    actions.resolve({
                                        resultCode: 'Authorised'
                                    });
                                },
                                tokenId: 'xxx',
                                lastFour: '1111',
                                brand: 'visa',
                                email: 'email@adyen.com',
                                fastlaneSessionId: 'xxx'
                            })
                        }
                    />
                )}
            </Checkout>
        );
    }
};

export default meta;
