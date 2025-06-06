import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../types';
import { ComponentContainer } from '../ComponentContainer';
import { Checkout } from '../Checkout';
import { BankTransferConfiguration } from '../../../src/components/BankTransfer/types';
import BankTransfer from '../../../src/components/BankTransfer';

type BankTransferStory = StoryObj<PaymentMethodStoryProps<BankTransferConfiguration>>;

const meta: Meta<PaymentMethodStoryProps<BankTransferConfiguration>> = {
    title: 'Components/Bank Transfer'
};

export const Default: BankTransferStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new BankTransfer(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'BE',
        amount: 2000,
        componentConfiguration: {
            //data: { shopperEmail: 'dd' },
            onChange: state => {
                console.log(state);
            }
        }
    }
};
export default meta;
