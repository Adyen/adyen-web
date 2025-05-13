import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../types';
import { UPIConfiguration } from '../../../src/components/UPI/types';
import { ComponentContainer } from '../ComponentContainer';
import { Checkout } from '../Checkout';
import UPI from '../../../src/components/UPI/UPI';
import { validateShopperId } from '../../helpers/checkout-api-calls';

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

export const WithVpaValidation: UpiStory = {
    render: ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<UPIConfiguration>) => (
        <Checkout checkoutConfig={checkoutConfig}>{checkout => <ComponentContainer element={new UPI(checkout, componentConfiguration)} />}</Checkout>
    ),
    args: {
        countryCode: 'IN',
        componentConfiguration: {
            defaultMode: 'vpa',

            onVpaValidation: async (
                validationData: { type: string; virtualPaymentAddress: string },
                actions: { resolve(): void; reject(): void }
            ) => {
                try {
                    const response = await validateShopperId(validationData);
                    console.log('onVpaValidation()', response);

                    if (response.status === 'VALID') return actions.resolve();
                    return actions.reject();
                } catch (error: unknown) {
                    console.log(error);
                    actions.reject();
                }
            }
        }
    }
};

export default meta;
