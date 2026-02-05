import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../storybook/components/Checkout';
import EMI from './EMI';
import { EMIConfiguration } from './types';

type EMIStory = StoryConfiguration<EMIConfiguration>;

const meta: MetaConfiguration<EMIConfiguration> = {
    title: 'Components/EMI',
    tags: ['no-automated-visual-test']
};

export const Default: EMIStory = {
    args: {
        countryCode: 'IN'
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

export default meta;
