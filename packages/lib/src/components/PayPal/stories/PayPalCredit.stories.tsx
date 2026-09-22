import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import { PaymentMethodStoryProps } from '../../../../storybook/types';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import PayPalCreditElement from '../PayPalCredit';
import type { BasePayPalConfiguration } from '../types';
import { Checkout } from '../../../../storybook/components/Checkout';

type Story = StoryObj<PaymentMethodStoryProps<BasePayPalConfiguration>>;

const meta: Meta = {
    title: 'Components/Wallets/Paypal/V6',
    tags: ['no-automated-visual-test']
};
export default meta;

export const PayPalCredit: Story = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new PayPalCreditElement(checkout, componentConfiguration)} />}
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
            onAuthorized: (data, actions) => {
                console.log('PayPal credit onAuthorized data', { data });
                actions.resolve();
            }
        }
    }
};
