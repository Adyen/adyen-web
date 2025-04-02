import { MetaConfiguration, StoryConfiguration } from '../types';
import { AchConfiguration } from '../../../src/components/Ach';
import { ComponentContainer } from '../ComponentContainer';
import Ach from '../../../src/components/Ach/Ach';
import { Checkout } from '../Checkout';

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
            holderNameRequired: false
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

export default meta;
