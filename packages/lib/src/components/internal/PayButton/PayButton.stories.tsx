import { h, createRef } from 'preact';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../../storybook/types';
import { Checkout } from '../../../../storybook/components/Checkout';
import { CoreProvider } from '../../../core/Context/CoreProvider';
import { AmountProvider } from '../../../core/Context/AmountProvider';
import PayButton from './PayButton';
import type { PaymentAmount } from '../../../types/global-types';

interface PayButtonStoryConfiguration {
    paymentAmount?: PaymentAmount;
    secondaryAmount?: PaymentAmount;
    disabled?: boolean;
}

type PayButtonStory = StoryConfiguration<PayButtonStoryConfiguration>;

const meta: MetaConfiguration<PayButtonStoryConfiguration> = {
    title: 'Components/PayButton'
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<PayButtonStoryConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>
        {checkout => (
            <CoreProvider loadingContext={checkout.options.loadingContext ?? ''} i18n={checkout.modules.i18n} resources={checkout.modules.resources}>
                <AmountProvider
                    amount={componentConfiguration?.paymentAmount}
                    secondaryAmount={componentConfiguration?.secondaryAmount}
                    providerRef={createRef()}
                >
                    <PayButton disabled={componentConfiguration?.disabled} onClick={() => console.log('Pay button clicked')} />
                </AmountProvider>
            </CoreProvider>
        )}
    </Checkout>
);

export const Default: PayButtonStory = {
    render,
    args: {
        componentConfiguration: {
            paymentAmount: { value: 1000, currency: 'EUR' }
        }
    }
};

export const WithSecondaryAmount: PayButtonStory = {
    render,
    args: {
        componentConfiguration: {
            paymentAmount: { value: 1000, currency: 'EUR' },
            secondaryAmount: { value: 1200, currency: 'USD' }
        }
    }
};

export const NlWithSecondaryAmount: PayButtonStory = {
    render,
    args: {
        shopperLocale: 'nl-NL',
        componentConfiguration: {
            paymentAmount: { value: 1000, currency: 'EUR' },
            secondaryAmount: { value: 1200, currency: 'USD' }
        }
    }
};

export const NoAmount: PayButtonStory = {
    render,
    args: {
        shopperLocale: 'nl-NL',
        componentConfiguration: {}
    }
};

export default meta;
