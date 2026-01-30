import { Fragment, h } from 'preact';
import { Meta, StoryObj } from '@storybook/preact-vite';
import { PaymentMethodStoryProps } from '../../../../storybook/types';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import Paypal from '..';
import { Checkout } from '../../../../storybook/components/Checkout';
import type { PayPalConfiguration } from '../types';

type Story = StoryObj<PaymentMethodStoryProps<PayPalConfiguration>>;

const meta: Meta = {
    title: 'Components/Wallets/Paypal'
};
export default meta;

export const Default: Story = {
    render: ({ componentConfiguration, ...checkoutConfig }) => {
        const useV6FromLocalStorage = localStorage.getItem('paypal-useV6');
        const useV6 = useV6FromLocalStorage ? JSON.parse(useV6FromLocalStorage) : false;

        return (
            <Fragment>
                <label>
                    <input
                        type="checkbox"
                        checked={useV6}
                        onChange={e => {
                            localStorage.setItem('paypal-useV6', (!useV6).toString());
                            window.location.reload();
                        }}
                    />
                    useV6
                </label>
                <Checkout checkoutConfig={checkoutConfig}>
                    {checkout => <ComponentContainer element={new Paypal(checkout, { ...componentConfiguration, useV6 })} />}
                </Checkout>
            </Fragment>
        );
    },
    args: {
        componentConfiguration: {
            blockPayPalCreditButton: false,
            blockPayPalPayLaterButton: false,
            blockPayPalVenmoButton: false
        }
    }
};
