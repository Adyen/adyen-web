import { MetaConfiguration, StoryConfiguration } from '../types';
import { ComponentContainer } from '../ComponentContainer';
import { KlarnConfiguration } from '../../../src/components/Klarna/types';
import Klarna from '../../../src/components/Klarna/KlarnaPayments';
import { Checkout } from '../Checkout';

type KlarnaStory = StoryConfiguration<KlarnConfiguration>;

const meta: MetaConfiguration<KlarnConfiguration> = {
    title: 'Components/Klarna'
};

export const Widget: KlarnaStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new Klarna(checkout, componentConfiguration)} />}
        </Checkout>
    ),

    args: {
        countryCode: 'NL',
        componentConfiguration: { useKlarnaWidget: true }
    }
};

export default meta;
