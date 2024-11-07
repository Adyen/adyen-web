import { h } from 'preact';
import { useState } from 'preact/hooks';
import { GlobalStoryProps } from '../../types';

import Dropin from '../../../../src/components/Dropin';
import Card from '../../../../src/components/Card';
import PayPal from '../../../../src/components/PayPal';

import { Checkout } from '../../Checkout';
import { ComponentContainer } from '../../ComponentContainer';
import { GuestShopperForm } from './components/GuestShopperForm';

interface Props {
    checkoutConfig: GlobalStoryProps;
}

export const FastlaneInSinglePageApp = ({ checkoutConfig }: Props) => {
    const [fastlaneData, setFastlaneData] = useState<any>(null);

    const handleOnCheckoutStep = (fastlaneSdk, fastlaneData, shippingAddress) => {
        console.log('FastlaneInSinglePageApp', fastlaneSdk, fastlaneData, shippingAddress);
        setFastlaneData(fastlaneData);
    };

    if (!fastlaneData) {
        return <GuestShopperForm onCheckoutStep={handleOnCheckoutStep} />;
    }

    return (
        <Checkout checkoutConfig={checkoutConfig}>
            {checkout => (
                <ComponentContainer element={new Dropin(checkout, { showStoredPaymentMethods: false, paymentMethodComponents: [Card, PayPal] })} />
            )}
        </Checkout>
    );
};
