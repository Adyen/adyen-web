import { Fragment, h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import { PaymentMethodStoryProps } from '../../../../storybook/types';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import Paypal from '..';
import type { PayPalConfiguration } from '../types';
import { Checkout } from '../../../../storybook/components/Checkout';
import { PayPalV6ConfigurationUpdateDemo } from './PayPalV6ConfigurationUpdateDemo';

type Story = StoryObj<PaymentMethodStoryProps<PayPalConfiguration>>;

const meta: Meta = {
    title: 'Components/Wallets/Paypal/V6'
};
export default meta;

export const Default: Story = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new Paypal(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        componentConfiguration: {
            usePayPalV6: {
                presentationModeOptions: {
                    presentationMode: 'auto'
                },
                style: {
                    paypal: {
                        type: 'buynow',
                        class: 'paypal-blue'
                    },
                    venmo: {
                        type: 'pay',
                        class: 'venmo-black'
                    }
                },
                vault: false,
                onAuthorized: (data, actions) => {
                    console.log('PayPalV6 onAuthorized data', { data });
                    actions.resolve();
                }
            }
        },
        paymentsOptions: {
            recurringProcessingModel: 'CardOnFile'
        },
        sessionData: {
            recurringProcessingModel: 'CardOnFile'
        }
    }
};

export const ZeroAuth: Story = {
    tags: ['no-automated-visual-test'],
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new Paypal(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        amount: 0,
        componentConfiguration: {
            usePayPalV6: {}
        },
        paymentsOptions: {
            recurringProcessingModel: 'CardOnFile'
        },
        sessionData: {
            recurringProcessingModel: 'CardOnFile'
        }
    }
};

export const WithPayPalV5: Story = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => (
                <div id="component-root">
                    <h3>PayPal V5</h3>
                    <ComponentContainer id="paypal-v5" element={new Paypal(checkout)} />
                    <h3>PayPal V6</h3>
                    <ComponentContainer
                        id="paypal-v6"
                        element={
                            new Paypal(checkout, {
                                ...componentConfiguration,
                                usePayPalV6: {}
                            })
                        }
                    />
                </div>
            )}
        </Checkout>
    ),
    args: {
        componentConfiguration: {}
    }
};

/**
 * Showcases 'paypal.update(props)': the PayPal SDK instance and the eligible payment methods are re-created
 * with the updated country code, currency, locale and payment flow. The demo owns the 'Checkout' wrapper,
 * since the zero-auth flow needs a session created with a zero amount.
 */
export const ConfigurationUpdate: Story = {
    tags: ['no-automated-visual-test'],
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <PayPalV6ConfigurationUpdateDemo checkoutConfig={checkoutConfig} componentConfiguration={componentConfiguration} />
    ),
    args: {
        componentConfiguration: {
            usePayPalV6: {
                onAuthorized: (data, actions) => {
                    console.log('PayPalV6 onAuthorized data', { data });
                    actions.resolve();
                }
            }
        },
        paymentsOptions: {
            recurringProcessingModel: 'CardOnFile'
        },
        sessionData: {
            recurringProcessingModel: 'CardOnFile'
        }
    }
};

export const Messaging: Story = {
    tags: ['no-automated-visual-test'],
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => (
                <Fragment>
                    <paypal-message id="paypal-message"></paypal-message>
                    <ComponentContainer element={new Paypal(checkout, componentConfiguration)} />
                </Fragment>
            )}
        </Checkout>
    ),
    args: {
        componentConfiguration: {
            usePayPalV6: {
                onCreatePayPalMessages: async createPayPalMessages => {
                    const messagesInstance = createPayPalMessages({
                        buyerCountry: 'US',
                        currencyCode: 'USD'
                    });
                    const messageElement = document.querySelector('#paypal-message');

                    const content = await messagesInstance.fetchContent({
                        textColor: 'MONOCHROME',
                        logoPosition: 'LEFT',
                        logoType: 'MONOGRAM',
                        amount: '100',
                        onReady: content => {
                            // @ts-ignore - messageElement is guaranteed to be a PayPalMessageElement
                            messageElement.setContent(content);
                        }
                    });

                    return content;
                }
            }
        }
    }
};
