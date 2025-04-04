import { MetaConfiguration, StoryConfiguration } from '../types';
import { ComponentContainer } from '../ComponentContainer';
import Ach from '../../../src/components/Ach';
import { Checkout } from '../Checkout';
import { AdyenCheckout, components } from '../../../src';
import type { AchConfiguration } from '../../../src/components/Ach/types';

type ACHStory = StoryConfiguration<AchConfiguration>;

const meta: MetaConfiguration<AchConfiguration> = {
    title: 'Components/ACH'
};

export const Default: ACHStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new Ach(checkout, componentConfiguration)} />}</Checkout>
    ),
    args: {
        countryCode: 'US',
        componentConfiguration: {
            onChange(state) {
                console.log(state);
            },

            onSubmit() {
                console.log('zzzz');
            },

            enableStoreDetails: true
        }
        // componentConfiguration: {
        //     data: {
        //         holderName: 'B. Fish',
        //         billingAddress: {
        //             street: 'Infinite Loop',
        //             postalCode: '95014',
        //             city: 'Cupertino',
        //             houseNumberOrName: '1',
        //             country: 'US',
        //             stateOrProvince: 'CA'
        //         }
        //     },
        //     enableStoreDetails: false
        // }
    }
};

export const WithDropin: ACHStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => {
        const { Dropin, Ach } = components;
        AdyenCheckout.register(Ach);

        return (
            <Checkout checkoutConfig={checkoutConfig}>
                {checkout => <ComponentContainer element={new Dropin(checkout, componentConfiguration)} />}
            </Checkout>
        );
    }
};

export default meta;
