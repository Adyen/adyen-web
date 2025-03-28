import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { PixConfiguration } from '../../../src/components/Pix/types';
import { ComponentContainer } from '../ComponentContainer';
import { Checkout } from '../Checkout';
import Pix from '../../../src/components/Pix/Pix';

type PixStory = StoryConfiguration<PixConfiguration>;

const meta: MetaConfiguration<PixConfiguration> = {
    title: 'Components/Pix'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<PixConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new Pix(checkout, componentConfiguration)} />}</Checkout>
);

export const Default: PixStory = {
    render,
    args: {
        countryCode: 'BR'
    }
};

export const WithPersonalDetails: PixStory = {
    render,
    args: {
        countryCode: 'BR',
        componentConfiguration: {
            onChange(data) {
                console.log(data);
            },
            personalDetailsRequired: true
        }
    }
};

export default meta;
