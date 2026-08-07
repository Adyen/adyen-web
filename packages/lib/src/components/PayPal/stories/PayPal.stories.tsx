import { Fragment, h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import { PaymentMethodStoryProps } from '../../../../storybook/types';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import Paypal from '..';
import type { PayPalConfiguration } from '../types';
import type { PayPalMessageElement } from '../paypal-js-types';
import { Checkout } from '../../../../storybook/components/Checkout';
import { DEFAULT_COUNTRY_CODE } from '../../../../storybook/config/commonConfig';

type Story = StoryObj<PaymentMethodStoryProps<PayPalConfiguration>>;

const meta: Meta = {
    title: 'Components/Wallets/Paypal'
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
            blockPayPalCreditButton: false,
            blockPayPalPayLaterButton: false,
            blockPayPalVenmoButton: false,
            onAuthorized: (data, actions) => {
                console.log('PayPal onAuthorized data', { data });
                actions.resolve();
            }
        }
    }
};

export const PaypalV6: Story = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new Paypal(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        componentConfiguration: {
            usePayPalV6: {
                countryCode: DEFAULT_COUNTRY_CODE,
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
                    console.log('PaypalV6 onAuthorized data', { data });
                    actions.resolve();
                }
            }
        }
    }
};

export const PaypalV6WithPayPalV5: Story = {
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
                                usePayPalV6: {
                                    countryCode: DEFAULT_COUNTRY_CODE
                                }
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

export const PaypalV6Messaging: Story = {
    tags: ['no-automated-visual-test'],
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => (
                <Fragment>
                    <paypal-message id="paypal-message"></paypal-message>
                    <ComponentContainer
                        element={
                            new Paypal(checkout, {
                                ...componentConfiguration,
                                usePayPalV6: {
                                    ...componentConfiguration.usePayPalV6,
                                    onCreatePayPalMessages: async createPayPalMessages => {
                                        const messagesInstance = createPayPalMessages({
                                            buyerCountry: componentConfiguration.countryCode,
                                            currencyCode: componentConfiguration.amount.currency
                                        });
                                        const messageElement = document.querySelector<PayPalMessageElement>('#paypal-message');

                                        const content = await messagesInstance.fetchContent({
                                            textColor: 'MONOCHROME',
                                            logoPosition: 'LEFT',
                                            logoType: 'NONE',
                                            amount: '100',
                                            onReady: content => {
                                                messageElement?.setContent(content);
                                            }
                                        });

                                        return content;
                                    }
                                }
                            })
                        }
                    />
                </Fragment>
            )}
        </Checkout>
    ),
    args: {
        componentConfiguration: {
            usePayPalV6: {
                countryCode: DEFAULT_COUNTRY_CODE
            }
        }
    }
};
