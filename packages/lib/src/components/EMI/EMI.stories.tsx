import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import getCurrency from '../../../storybook/utils/get-currency';
import EMI from './EMI';
import { EmiPlansLoader } from './stories/EmiPlansLoader';
import { emiPlansHandlers } from './stories/handlers';
import type { ComponentChildren } from 'preact';
import type { ICore } from '../../core/types';
import type { EMIConfiguration, EmiPlansResponse } from './types';

type EMIStory = StoryConfiguration<EMIConfiguration>;

const meta: MetaConfiguration<EMIConfiguration> = {
    title: 'Components/EMI',
    tags: ['no-automated-visual-test'],
    parameters: { msw: { handlers: emiPlansHandlers } }
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
            fundingSourceConfiguration: {
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
            fundingSourceConfiguration: {
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
