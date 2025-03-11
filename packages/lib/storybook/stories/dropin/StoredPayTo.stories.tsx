import { MetaConfiguration, PaymentMethodStoryProps } from '../types';
import { DropinConfiguration } from '../../../src/components/Dropin/types';
import { AdyenCheckout, components, Dropin as DropinComponent } from '../../../src';
import { Checkout } from '../Checkout';
import { ComponentContainer } from '../ComponentContainer';

const meta: MetaConfiguration<DropinConfiguration> = {
    title: 'Dropin/PayTo',
    argTypes: {
        componentConfiguration: {
            control: 'object'
        },
        paymentMethodsOverride: {
            control: 'object',
            if: { arg: 'useSessions', truthy: false }
        },
        sessionData: {
            control: 'object',
            if: { arg: 'useSessions', truthy: true }
        }
    },
    args: {}
};

export const PayToWithMandate = {
    name: 'Create stored (sessions)',
    args: {
        useSessions: true,
        countryCode: 'AU',
        shopperLocale: 'en-US',
        amount: 1000,
        showPayButton: true,
        sessionData: {
            mandate: {
                amount: '10000',
                amountRule: 'max',
                endsAt: '2027-10-01',
                frequency: 'adhoc',
                remarks: 'Remark on mandate'
            },
            shopperReference: 'dropin-mandate',
            storePaymentMethodMode: 'enabled',
            recurringProcessingModel: 'CardOnFile'
        }
    },

    render: ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<DropinConfiguration>) => {
        const { Dropin, ...Components } = components;
        const Classes = Object.keys(Components).map(key => Components[key]);
        AdyenCheckout.register(...Classes);

        return (
            <Checkout checkoutConfig={checkoutConfig}>
                {checkout => <ComponentContainer element={new DropinComponent(checkout, componentConfiguration)} />}
            </Checkout>
        );
    }
};

export const StoredPayToMandate = {
    name: 'Use stored (sessions)',
    args: {
        useSessions: true,
        countryCode: 'AU',
        shopperLocale: 'en-US',
        amount: 1000,
        showPayButton: true,
        sessionData: {
            shopperReference: 'dropin-mandate',
            recurringProcessingModel: 'CardOnFile'
        }
    },

    render: ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<DropinConfiguration>) => {
        const { Dropin, ...Components } = components;
        const Classes = Object.keys(Components).map(key => Components[key]);
        AdyenCheckout.register(...Classes);

        return (
            <Checkout checkoutConfig={checkoutConfig}>
                {checkout => <ComponentContainer element={new DropinComponent(checkout, componentConfiguration)} />}
            </Checkout>
        );
    }
};

export default meta;
