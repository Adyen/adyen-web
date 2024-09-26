import { MetaConfiguration, StoryConfiguration } from '../types';
import { CardConfiguration } from '../../../src/components/Card/types';
import Bancontact from '../../../src/components/Card/Bancontact';
import { ComponentContainer } from '../ComponentContainer';
import { Checkout } from '../Checkout';

type BancontactStory = StoryConfiguration<CardConfiguration>;

const meta: MetaConfiguration<CardConfiguration> = {
    title: 'Cards/Bancontact'
};

export const Default: BancontactStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new Bancontact(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        componentConfiguration: {
            _disableClickToPay: true
        },
        countryCode: 'BE'
    }
};

export default meta;
