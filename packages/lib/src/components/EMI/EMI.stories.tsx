import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import EMI from './EMI';
import { EMIConfiguration } from './types';
import { emiSetupHandler, transformEMIDataToSelectItems } from './offers';
import emiOfferMock from './paymentResponseOfferMock.json';

import type { EMIPaymentMethodData } from './offers/types';

type EMIStory = StoryConfiguration<EMIConfiguration>;

const meta: MetaConfiguration<EMIConfiguration> = {
    title: 'Components/EMI',
    tags: ['no-automated-visual-test']
};

const offersData = transformEMIDataToSelectItems(emiOfferMock as EMIPaymentMethodData, 100000, 'INR');

export const Default: EMIStory = {
    args: {
        countryCode: 'IN',
        componentConfiguration: {
            offersData
        }
    },

    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout
            checkoutConfig={{
                ...checkoutConfig,
                showPayButton: true
            }}
        >
            {checkout => {
                const emi = new EMI(checkout, {
                    ...componentConfiguration,
                    fundingSourceConfiguration: {
                        card: {
                            onBinValue: (binData: any) => {
                                console.log('Merchant onBinValue prop:', binData);
                            }
                        }
                    }
                });

                window.emi = emi;

                return <ComponentContainer element={emi} />;
            }}
        </Checkout>
    )
};

export const WithMSWInterception: EMIStory = {
    args: {
        countryCode: 'IN',
        useSessions: true,
        componentConfiguration: {
            offersData
        }
    },
    parameters: {
        msw: {
            handlers: [emiSetupHandler]
        }
    },
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout
            checkoutConfig={{
                ...checkoutConfig,
                showPayButton: true
            }}
        >
            {checkout => <ComponentContainer element={new EMI(checkout, componentConfiguration)} />}
        </Checkout>
    )
};

export default meta;
