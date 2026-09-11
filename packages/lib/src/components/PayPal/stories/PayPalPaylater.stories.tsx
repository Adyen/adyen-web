import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import { PaymentMethodStoryProps } from '../../../../storybook/types';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import PaypalPaylater from '../PaypalPaylater';
import type { PayPalPayLaterConfiguration } from '../types';
import { Checkout } from '../../../../storybook/components/Checkout';

type Story = StoryObj<PaymentMethodStoryProps<PayPalPayLaterConfiguration>>;

const meta: Meta = {
    title: 'Components/Wallets/Paypal/V6',
    tags: ['no-automated-visual-test']
};
export default meta;

export const PayPalPaylater: Story = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new PaypalPaylater(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'US',
        sessionData: {
            splitPayPalButtons: true
        },
        paymentMethodsOptions: {
            splitPayPalButtons: true
        },
        componentConfiguration: {
            hidePayPalMessaging: false,
            onAuthorized: (data, actions) => {
                console.log('PayPal paylater onAuthorized data', { data });
                actions.resolve();
            }
        }
    }
};
