import { h } from 'preact';
import { useState } from 'preact/hooks';
import { MetaConfiguration, PaymentMethodStoryProps, StoryConfiguration } from '../../../../../storybook/types';
import { Checkout } from '../../../../../storybook/components/Checkout';
import { CoreProvider } from '../../../../core/Context/CoreProvider';
import { ClickToPaySignup } from './ClickToPaySignup';
import type { ClickToPaySignupDetails } from './types';

interface ClickToPaySignupStoryConfiguration extends ClickToPaySignupDetails {
    defaultChecked?: boolean;
    countryCode?: string;
}

type ClickToPaySignupStory = StoryConfiguration<ClickToPaySignupStoryConfiguration>;

const meta: MetaConfiguration<ClickToPaySignupStoryConfiguration> = {
    title: 'Internal Elements/ClickToPaySignup',
    tags: ['no-automated-visual-test']
};

const ClickToPaySignupWithState = ({ defaultChecked = false, ...details }: Readonly<ClickToPaySignupStoryConfiguration>) => {
    const [checked, setChecked] = useState<boolean>(defaultChecked);

    return (
        <ClickToPaySignup
            {...details}
            checked={checked}
            onConsentChange={consentGiven => {
                console.log('onConsentChange', consentGiven);
                setChecked(consentGiven);
            }}
            onDetailsChange={signupDetails => console.log('onDetailsChange', signupDetails)}
        />
    );
};

const render = ({ componentConfiguration, ...checkoutConfig }: PaymentMethodStoryProps<ClickToPaySignupStoryConfiguration>) => (
    <Checkout checkoutConfig={checkoutConfig}>
        {checkout => {
            console.log(checkout);

            return (
                /* mimic the ComponentContainer markup so the a11y tests can find the component */
                <div id="component-root" className="component-wrapper">
                    <CoreProvider
                        loadingContext={checkout.session.loadingContext ?? ''}
                        i18n={checkout.modules.i18n}
                        resources={checkout.modules.resources}
                    >
                        <ClickToPaySignupWithState countryCode={checkoutConfig.countryCode} {...componentConfiguration} />
                    </CoreProvider>
                </div>
            );
        }}
    </Checkout>
);

export const Default: ClickToPaySignupStory = {
    render,
    args: {
        componentConfiguration: {}
    }
};

export const Prefilled: ClickToPaySignupStory = {
    render,
    args: {
        componentConfiguration: {
            defaultChecked: true,
            firstName: 'Arjen',
            lastName: 'Landstra',
            shopperEmail: 'arjen.landstra@example.com',
            telephoneNumber: '+31612345678'
        }
    }
};

export default meta;
