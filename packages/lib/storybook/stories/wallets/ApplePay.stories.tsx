import { MetaConfiguration, StoryConfiguration } from '../types';
import { ComponentContainer } from '../ComponentContainer';
import { ApplePayConfiguration } from '../../../src/components/ApplePay/types';
import ApplePay from '../../../src/components/ApplePay';
import { Checkout } from '../Checkout';

type ApplePayStory = StoryConfiguration<ApplePayConfiguration>;

const meta: MetaConfiguration<ApplePayConfiguration> = {
    title: 'Wallets/ApplePay'
};

export const Default: ApplePayStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new ApplePay(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        componentConfiguration: {
            buttonColor: 'white-outline',
            // Setting to Modal here because Storybook will run the Component within an iframe, which means the ApplePay code would be displayed as a new window by default
            renderApplePayCodeAs: 'modal'
        }
    }
};

export const WithCustomPayButton: ApplePayStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => {
                const applepay = new ApplePay(checkout, componentConfiguration);
                return (
                    <div id="component-root" className="component-wrapper">
                        <button onClick={() => applepay.submit()}>Pay with ApplePay</button>
                    </div>
                );
            }}
        </Checkout>
    ),
    args: {
        componentConfiguration: {
            showPayButton: false,
            // Setting to Modal here because Storybook will run the Component within an iframe, which means the ApplePay code would be displayed as a new window by default
            renderApplePayCodeAs: 'modal'
        }
    }
};

export default meta;
