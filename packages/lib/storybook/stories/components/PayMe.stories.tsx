import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { QRLoaderConfiguration } from '../../../src/types';
import { ComponentContainer } from '../ComponentContainer';
import { Checkout } from '../Checkout';
import PayMe from '../../../src/components/PayMe/PayMe';

type PayMeStory = StoryConfiguration<QRLoaderConfiguration>;

const meta: MetaConfiguration<QRLoaderConfiguration> = {
    title: 'Components/PayMe'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<QRLoaderConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new PayMe(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: PayMeStory = {
    render,
    args: {
        countryCode: 'HK'
    }
};

export default meta;
