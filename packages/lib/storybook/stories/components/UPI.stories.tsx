import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { UPIConfiguration } from '../../../src/components/UPI/types';
import { ComponentContainer } from '../ComponentContainer';
import { Checkout } from '../Checkout';
import UPI from '../../../src/components/UPI/UPI';

type UpiStory = StoryConfiguration<UPIConfiguration>;

const meta: MetaConfiguration<UPIConfiguration> = {
    title: 'Components/UPI'
};

export const Default: UpiStory = {
    render: ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<UPIConfiguration>) => (
        <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new UPI(checkout, componentConfiguration)} />}</Checkout>
    ),
    args: {
        countryCode: 'IN'
    }
};

export default meta;
