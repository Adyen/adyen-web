import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import getCurrency from '../../../storybook/utils/get-currency';
import EMI from './EMI';
import { EmiPlansLoader } from './stories/EmiPlansLoader';
import { EmiResolvedConfig } from './stories/EmiResolvedConfig';
import { emiPlansHandlers } from './stories/handlers';
import { emiSplitFundingSourcesPaymentMethods } from './stories/mocks';
import type { ComponentChildren } from 'preact';
import type { ICore } from '../../core/types';
import type { EMIConfiguration, EmiPlansResponse } from './types';

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

/**
 * Advanced flow throughout: the plans lookup is merchant-authenticated, so sessions integrations
 * cannot offer plan selection until the sessions endpoint ships.
 */
const withPlans = (
    { componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<EMIConfiguration>,
    render: (checkout: ICore, configuration: EMIConfiguration) => ComponentChildren
) => (
    <Checkout checkoutConfig={checkoutConfig}>
        {checkout => (
            <EmiPlansLoader amount={{ value: checkoutConfig.amount, currency: getCurrency(checkoutConfig.countryCode) }}>
                {(plans?: EmiPlansResponse) => render(checkout, { ...componentConfiguration, plans })}
            </EmiPlansLoader>
        )}
    </Checkout>
);

export const CardEmi: EMIStory = {
    render: storyProps => withPlans(storyProps, (checkout, configuration) => <ComponentContainer element={new EMI(checkout, configuration)} />),
    args: {
        useSessions: false,
        countryCode: 'IN',
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
    render: storyProps =>
        withPlans(storyProps, (checkout, configuration) => {
            const emi = new EMI(checkout, configuration);
            return (
                <div>
                    <ComponentContainer element={emi} />
                    <button id="custom-pay-button" onClick={() => emi.submit()}>
                        Pay with EMI
                    </button>
                </div>
            );
        }),
    args: {
        useSessions: false,
        countryCode: 'IN',
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

const withResolvedConfigPanel = (storyProps: PaymentMethodStoryProps<EMIConfiguration>) =>
    withPlans(storyProps, (checkout, configuration) => {
        const emi = new EMI(checkout, configuration);
        return (
            <div>
                <ComponentContainer element={emi} />
                <EmiResolvedConfig emi={emi} />
            </div>
        );
    });

/**
 * A `splitCardFundingSources` merchant, driven entirely by the `/paymentMethods` response: EMI takes
 * its `supportedPaymentMethods` from the `emi` entry, so the credit and debit split arrives without
 * any component configuration.
 */
export const CardEmiSplitFundingSources: EMIStory = {
    render: withResolvedConfigPanel,
    args: {
        useSessions: false,
        countryCode: 'IN',
        paymentMethodsOverride: emiSplitFundingSourcesPaymentMethods,
        componentConfiguration: {
            showPayButton: true
        }
    }
};

/**
 * The same split, configured on the component instead. Edit `supportedPaymentMethods` and
 * `supportedPaymentMethodsConfiguration.card.fundingSource` in the controls: the Card resolves its
 * brands from the response entry matching the funding source it was given.
 */
export const CardEmiSplitFundingSourcesViaConfig: EMIStory = {
    render: withResolvedConfigPanel,
    args: {
        useSessions: false,
        countryCode: 'IN',
        paymentMethodsOverride: emiSplitFundingSourcesPaymentMethods,
        componentConfiguration: {
            showPayButton: true,
            supportedPaymentMethods: [
                { type: 'scheme', name: 'Debit Card', fundingSource: 'debit', brands: ['visa', 'maestro'] },
                { type: 'scheme', name: 'Credit Card', fundingSource: 'credit', brands: ['visa', 'mc', 'amex'] }
            ],
            supportedPaymentMethodsConfiguration: {
                card: {
                    fundingSource: 'debit',
                    hasHolderName: false
                }
            }
        }
    }
};

export default meta;
