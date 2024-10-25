import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { QRLoaderConfiguration } from '../../../src/types';
import { ComponentContainer } from '../ComponentContainer';
import { Checkout } from '../Checkout';
import Swish from '../../../src/components/Swish';

type SwishStory = StoryConfiguration<QRLoaderConfiguration>;

const meta: MetaConfiguration<QRLoaderConfiguration> = {
    title: 'Components/Swish'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<QRLoaderConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new Swish(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: SwishStory = {
    render,
    args: {
        countryCode: 'SE'
    }
};

export default meta;
