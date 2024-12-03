import { h } from 'preact';
import { useState } from 'preact/hooks';
import { GlobalStoryProps } from '../../types';

import Dropin from '../../../../src/components/Dropin';
import Card from '../../../../src/components/Card';
import PayPal from '../../../../src/components/PayPal';
import Fastlane from '../../../../src/components/PayPalFastlane';

import { Checkout } from '../../Checkout';
import { ComponentContainer } from '../../ComponentContainer';
import { GuestShopperForm } from './components/GuestShopperForm';

interface Props {
    checkoutConfig: GlobalStoryProps;
}

export const FastlaneInSinglePageApp = ({ checkoutConfig }: Props) => {
    const [componentConfig, setComponentConfig] = useState<any>(null);

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
                                fastlane: { tokenId: 'xxx', customerId: 'sss', lastFour: '1111', brand: 'visa', email: 'email@adyen.com' }
                            }
                        })
                    }
                />
            )}
        </Checkout>
    );
};
