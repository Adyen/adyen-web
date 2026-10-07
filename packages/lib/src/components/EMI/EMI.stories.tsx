import { h } from 'preact';
import { EMI } from '@adyen/adyen-web';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import { emiPlansHandlers } from './stories/handlers';
import { EMI_FIXTURE_CHECKOUT_AMOUNT } from './stories/mocks';
import type { EMIConfiguration } from './types';

type EMIStory = StoryConfiguration<EMIConfiguration>;

const meta: MetaConfiguration<EMIConfiguration> = {
    title: 'Components/EMI',
    tags: ['no-automated-visual-test'],
    parameters: { msw: { handlers: emiPlansHandlers } },
    argTypes: {
        componentConfiguration: {
            control: 'object'
        },
        paymentMethodsOverride: {
            control: 'object',
            if: { arg: 'useSessions', truthy: false }
        }
    }
};

export const CardEmi: EMIStory = {
    render: ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<EMIConfiguration>) => (
        <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new EMI(checkout, componentConfiguration)} />}</Checkout>
    ),
    args: {
        useSessions: false,
        countryCode: 'IN',
        // The mocked lookup prices its plans for this amount, so the summary only adds up with it
        amount: EMI_FIXTURE_CHECKOUT_AMOUNT.value,
        componentConfiguration: {
            showPayButton: true,
            supportedPaymentMethods: [{ type: 'scheme' }],
            supportedPaymentMethodsConfiguration: {
                card: {
                    hasHolderName: false,
                    onBinLookup(data) {
                        console.log('onBinLookup', data);
                    }
                }
            }
        }
    }
};

export const CardEmiWithCustomButton: EMIStory = {
    render: ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<EMIConfiguration>) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => {
                const emi = new EMI(checkout, componentConfiguration);
                return (
                    <div>
                        <ComponentContainer element={emi} />
                        <button id="custom-pay-button" onClick={() => emi.submit()}>
                            Pay with EMI
                        </button>
                    </div>
                );
            }}
        </Checkout>
    ),
    args: {
        useSessions: false,
        countryCode: 'IN',
        amount: EMI_FIXTURE_CHECKOUT_AMOUNT.value,
        componentConfiguration: {
            showPayButton: false,
            supportedPaymentMethods: [{ type: 'scheme' }],
            supportedPaymentMethodsConfiguration: {
                card: {
                    hasHolderName: false,
                    onBinLookup(data) {
                        console.log('onBinLookup', data);
                    }
                }
            }
        }
    }
};

export default meta;
