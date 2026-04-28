import { h } from 'preact';
import { StoryObj } from '@storybook/preact';
import { GlobalStoryProps, MetaConfiguration, PaymentMethodStoryProps } from '../../../storybook/types';
import { UPIConfiguration } from './types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import UPI from './UPI';
import type { Mandate } from './components/UPIMandate/UPIMandate';

interface ExtendedStoryArgs extends PaymentMethodStoryProps<UPIConfiguration> {
    mandate: Mandate;
}
type UpiStory = StoryObj<ExtendedStoryArgs>;

const meta: MetaConfiguration<UPIConfiguration> = {
    title: 'Components/UPI'
};

export const Default: UpiStory = {
    render: ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<UPIConfiguration>) => (
        <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new UPI(checkout, componentConfiguration)} />}</Checkout>
    ),
    args: {
        countryCode: 'IN',
        amount: 1005,
        componentConfiguration: {
            onChange(state) {
                console.log({ state });
            }
        }
    }
};

const MANDATE: Mandate = {
    amount: '7005',
    frequency: 'adhoc',
    amountRule: 'max',
    endsAt: '2030-07-21',
    remarks: 'Subscription'
};

const passMandateToPayments = (mandate: Mandate, checkoutConfig: GlobalStoryProps): GlobalStoryProps => {
    if (checkoutConfig.useSessions) {
        return {
            ...checkoutConfig,
            sessionData: {
                ...checkoutConfig.sessionData,
                mandate: mandate
            }
        };
    } else {
        return {
            ...checkoutConfig,
            paymentsOptions: {
                ...checkoutConfig.paymentsOptions,
                mandate: mandate
            }
        };
    }
};

export const AutoPaySession: UpiStory = {
    render: ({ componentConfiguration, mandate, ...checkoutConfig }) => (
        <Checkout checkoutConfig={passMandateToPayments(mandate, checkoutConfig)}>
            {checkout => <ComponentContainer element={new UPI(checkout, { mandate, ...componentConfiguration })} />}
        </Checkout>
    ),
    args: {
        countryCode: 'IN',
        amount: 7005,
        useSessions: true,
        mandate: MANDATE,
        sessionData: {
            shopperReference: 'upi-autopay-shopper',
            storePaymentMethod: true,
            shopperInteraction: 'Ecommerce',
            recurringProcessingModel: 'Subscription'
        }
    }
};

export default meta;
