import { h } from 'preact';
import { useState } from 'preact/hooks';
import { GlobalStoryProps } from '../../../../storybook/types';

import Dropin from '../../Dropin';
import Card from '../../Card';
import PayPal from '../../PayPal';
import Fastlane from '..';

import { Checkout } from '../../../../storybook/components/Checkout';
import { ComponentContainer } from '../../../../storybook/components/ComponentContainer';
import { GuestShopperForm } from './components/GuestShopperForm';
import type { FastlanePaymentMethodConfiguration } from '../types';

interface Props {
    checkoutConfig: GlobalStoryProps;
}

export const FastlaneInSinglePageApp = ({ checkoutConfig }: Props) => {
    const [componentConfig, setComponentConfig] = useState<FastlanePaymentMethodConfiguration>(null);

    const handleOnCheckoutStep = config => {
        console.log('Component config:', config);
        setComponentConfig(config);
    };

    if (!componentConfig) {
        return <GuestShopperForm onCheckoutStep={handleOnCheckoutStep} />;
    }

    return (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => (
                <ComponentContainer
                    element={
                        new Dropin(checkout, {
                            showStoredPaymentMethods: false,
                            paymentMethodComponents: [Card, PayPal, Fastlane],
                            paymentMethodsConfiguration: {
                                [componentConfig.paymentType]: componentConfig.configuration
                            }
                        })
                    }
                />
            )}
        </Checkout>
    );
};
