import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import { PaymentMethodStoryProps } from '../../../../storybook/types';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import PaypalCredit from '../PaypalCredit';
import type { BasePayPalConfiguration } from '../types';
import { Checkout } from '../../../../storybook/components/Checkout';

type Story = StoryObj<PaymentMethodStoryProps<BasePayPalConfiguration>>;

const meta: Meta = {
    title: 'Components/Wallets/Paypal',
    tags: ['no-automated-visual-test']
};
export default meta;

export const PayPalCredit: Story = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new PaypalCredit(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'US',
        componentConfiguration: {
            onAuthorized: (data, actions) => {
                console.log('PayPal credit onAuthorized data', { data });
                actions.resolve();
            }
        }
    }
};
