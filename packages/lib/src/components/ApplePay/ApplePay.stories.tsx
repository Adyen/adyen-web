import { h } from 'preact';
import { MetaConfiguration, StoryConfiguration } from '../../../storybook/types';
import { ComponentContainer } from '../../../storybook/components/ComponentContainer';
import { ApplePayConfiguration } from './types';
import ApplePay from './ApplePay';
import { Checkout } from '../../../storybook/components/Checkout';

type ApplePayStory = StoryConfiguration<ApplePayConfiguration>;

const meta: MetaConfiguration<ApplePayConfiguration> = {
    title: 'Components/Wallets/ApplePay',
    tags: ['no-automated-visual-test']
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

export const CouponCodes: ApplePayStory = {
    render: ({ componentConfiguration, ...checkoutConfig }) => (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => <ComponentContainer element={new ApplePay(checkout, componentConfiguration)} />}
        </Checkout>
    ),
    args: {
        componentConfiguration: {
            buttonColor: 'white-outline',
            // Setting to Modal here because Storybook will run the Component within an iframe, which means the ApplePay code would be displayed as a new window by default
            renderApplePayCodeAs: 'modal',
            couponCode: 'TESTCOUPONCODE',
            supportsCouponCode: true,
            onCouponCodeChange: (resolve, reject, event) => {
                console.log('onCouponCodeChange', event);
                resolve({
                    newTotal: {
                        label: 'Total',
                        amount: '200'
                    }
                });
            }
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
