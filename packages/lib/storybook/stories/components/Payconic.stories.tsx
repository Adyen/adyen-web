import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { QRLoaderConfiguration } from '../../../src/types';
import { ComponentContainer } from '../ComponentContainer';
import { Checkout } from '../Checkout';
import BcmcMobile from '../../../src/components/BcmcMobile';

type PayconicStory = StoryConfiguration<QRLoaderConfiguration>;

const meta: MetaConfiguration<QRLoaderConfiguration> = {
    title: 'Components/Payconic'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<QRLoaderConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>
        {checkout => <ComponentContainer element={new BcmcMobile(checkout, componentConfiguration)} />}
    </Checkout>
);

export const Default: PayconicStory = {
    render,
    args: {
        countryCode: 'BE'
    }
};

export default meta;
