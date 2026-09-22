import { h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import { PaymentMethodStoryProps } from '../../../../storybook/types';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import PayPalPaylaterElement from '../PayPalPaylater';
import type { PayPalPayLaterConfiguration } from '../types';
import { Checkout } from '../../../../storybook/components/Checkout';
import { PayPalPaylaterAmountUpdateDemo } from './PayPalPaylaterAmountUpdateDemo';

type Story = StoryObj<PaymentMethodStoryProps<PayPalPayLaterConfiguration>>;

const meta: Meta = {
    title: 'Components/Wallets/Paypal/V6',
    tags: ['no-automated-visual-test']
};
export default meta;

export const PayPalPaylater: Story = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new PayPalPaylaterElement(checkout, componentConfiguration)} />}
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

/**
 * Showcases updating the amount of a live checkout. The demo owns the session, since patching the amount of
 * an in-flight payment is only possible in the sessions flow, so the sessions toggle and the amount control
 * do not apply here.
 */
export const PayPalPaylaterAmountUpdate: Story = {
    render: ({ countryCode, shopperLocale }) => <PayPalPaylaterAmountUpdateDemo countryCode={countryCode} shopperLocale={shopperLocale} />,
    args: {
        countryCode: 'US'
    },
    argTypes: {
        useSessions: {
            control: false
        },
        amount: {
            control: false
        },
        showPayButton: {
            control: false
        }
    }
};
