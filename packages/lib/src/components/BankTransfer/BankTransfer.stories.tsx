import { h } from "preact";
import { Meta, StoryObj } from '@storybook/preact';
import { PaymentMethodStoryProps } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import { BankTransferConfiguration } from './types';
import BankTransfer from '.';

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
            onChange: state => {
                console.log(state);
            }
        }
    }
};

export const BankTransferResultExample: BankTransferStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new BankTransfer(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'BE',
        amount: 2000,
        componentConfiguration: {
            paymentMethodType: 'bankTransfer_IBAN',
            type: 'bankTransfer',
            totalAmount: {
                currency: 'EUR',
                value: 2000
            },
            beneficiary: 'TestMerchantCheckout',
            iban: 'NL63ADYX3000571781',
            bic: 'ADYXNL2A',
            reference: '88GH47'
        }
    }
};
export default meta;
