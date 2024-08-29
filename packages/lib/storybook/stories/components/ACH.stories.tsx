import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { getStoryContextCheckout } from '../../utils/get-story-context-checkout';
import { AchConfiguration } from '../../../src/components/Ach/types';
import { Container } from '../Container';
import { Ach } from '../../../src';

type ACHStory = StoryConfiguration<AchConfiguration>;

const meta: MetaConfiguration<AchConfiguration> = {
    title: 'Components/ACH'
};

export const Default: ACHStory = {
    render: (args: PaymentMethodStoryProps<AchConfiguration>, context) => {
        const { componentConfiguration } = args;
        const checkout = getStoryContextCheckout(context);
        const ach = new Ach(checkout, componentConfiguration);
        return <Container element={ach} />;
    },
    args: {
        countryCode: 'US',
        componentConfiguration: {
            data: {
                holderName: 'B. Fish',
                billingAddress: {
                    street: 'Infinite Loop',
                    postalCode: '95014',
                    city: 'Cupertino',
                    houseNumberOrName: '1',
                    country: 'US',
                    stateOrProvince: 'CA'
                }
            },
            enableStoreDetails: false
        }
    }
};

export default meta;
