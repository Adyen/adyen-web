import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { QRLoaderConfiguration } from '../../../src/types';
import { ComponentContainer } from '../ComponentContainer';
import { Checkout } from '../Checkout';
import PayNow from '../../../src/components/PayNow/PayNow';

type PayNowStory = StoryConfiguration<QRLoaderConfiguration>;

const meta: MetaConfiguration<QRLoaderConfiguration> = {
    title: 'Components/PayNow'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<QRLoaderConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new PayNow(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: PayNowStory = {
    render,
    args: {
        countryCode: 'SG'
    }
};

export default meta;
