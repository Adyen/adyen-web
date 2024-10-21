import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { ComponentContainer } from '../ComponentContainer';
import { Checkout } from '../Checkout';
import Riverty from '../../../src/components/Riverty';
import { OpenInvoiceConfiguration } from '../../../src/components/helpers/OpenInvoiceContainer/types';

type RivertyStory = StoryConfiguration<OpenInvoiceConfiguration>;

const meta: MetaConfiguration<OpenInvoiceConfiguration> = {
    title: 'Components/Riverty'
};

export const Default: RivertyStory = {
    render: ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<OpenInvoiceConfiguration>) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new Riverty(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        countryCode: 'DE',
        srConfig: { showPanel: false }
    }
};

export default meta;
