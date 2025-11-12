import { h } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../../storybook/types';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import { Checkout } from '../../../../storybook/components/Checkout';
import { RedirectConfiguration } from '../types';
import RedirectElement from '..';

type RedirectStory = StoryConfiguration<RedirectConfiguration>;

const meta: MetaConfiguration<RedirectConfiguration> = {
    title: 'Components/Redirect',
    render: ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<RedirectConfiguration>) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => {
                if (!checkout.paymentMethodsResponse.paymentMethods.some(pm => pm.type === componentConfiguration.type)) {
                    return <div>Payment method with type: `{componentConfiguration.type}` is not available</div>;
                }

                return <ComponentContainer element={new RedirectElement(checkout, componentConfiguration)} />;
            }}
        </Checkout>
    )
};

export const Default: RedirectStory = {
    args: {
        countryCode: 'CH',
        componentConfiguration: { type: 'unionpay' }
    }
};

export const Ideal: RedirectStory = {
    args: {
        countryCode: 'NL',
        componentConfiguration: { type: 'ideal' }
    }
};

export const AlipayHK: RedirectStory = {
    args: {
        countryCode: 'HK',
        componentConfiguration: { type: 'alipay_hk' }
    }
};

export default meta;
