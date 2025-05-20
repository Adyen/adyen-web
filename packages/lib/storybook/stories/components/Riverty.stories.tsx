import { ComponentContainer } from '../ComponentContainer';
import { Checkout } from '../Checkout';
import Riverty from '../../../src/components/Riverty';

import type { MetaConfiguration, PaymentMethodStoryProps, ShopperDetails, StoryConfiguration } from '../types';
import type { RedirectConfiguration } from '../../../src/components/Redirect/types';

type RivertyStory = StoryConfiguration<RedirectConfiguration>;

const meta: MetaConfiguration<RedirectConfiguration> = {
    title: 'Components/Riverty'
};

const shopperDetails: ShopperDetails = {
    shopperName: {
        firstName: 'Jon',
        lastName: 'Doe'
    },
    telephoneNumber: '0612345678',
    shopperEmail: 'test@adyen.com',
    dateOfBirth: '1990-08-10',
    shopperIP: '172.0.0.1',
    billingAddress: {
        city: 'Amsterdam',
        country: 'NL',
        houseNumberOrName: '6',
        postalCode: '1011DJ',
        street: 'Simon Carmiggeltstraat'
    },
    deliveryAddress: {
        city: 'Amsterdam',
        country: 'NL',
        houseNumberOrName: '6',
        postalCode: '1011DJ',
        street: 'Simon Carmiggeltstraat'
    }
};

export const Default: RivertyStory = {
    render: ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<RedirectConfiguration>) => (
        <Checkout checkoutConfig={checkoutConfig} shopperDetails={shopperDetails}>
            {checkout => <ComponentContainer element={new Riverty(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'NL'
    }
};

export default meta;
