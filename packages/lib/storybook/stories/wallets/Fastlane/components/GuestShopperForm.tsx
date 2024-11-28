import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { CollectEmail } from './CollectEmail';
import { Shipping } from './Shipping';
import { ShippingWithFastlane } from './ShippingWithFastlane';
import './FastlaneStory.scss';

import initializeFastlane from '../../../../../src/components/PayPalFastlane/initializeFastlane';
import FastlaneSDK from '../../../../../src/components/PayPalFastlane/FastlaneSDK';
import type { FastlaneAuthenticatedCustomerResult } from '../../../../../src/components/PayPalFastlane/types';

interface GuestShopperFormProps {
    onCheckoutStep(componentConfig): void;
}

export const GuestShopperForm = ({ onCheckoutStep }: GuestShopperFormProps) => {
    const [fastlane, setFastlane] = useState<FastlaneSDK>(null);
    const [fastlaneAuthResult, setFastlaneAuthResult] = useState<FastlaneAuthenticatedCustomerResult>(null);

    const loadFastlane = async () => {
        const sdk = await initializeFastlane({
            clientKey: 'test_JC3ZFTA6WFCCRN454MVDEYOWEI5D3LT2', // Joost clientkey
            environment: 'test'
        });
        setFastlane(sdk);
    };

    const handleOnEditEmail = () => {
        setFastlaneAuthResult(null);
    };

    const handleFastlaneLookup = data => {
        setFastlaneAuthResult(data);
    };

    const handleOnCheckoutClick = (shippingAddress?: any) => {
        console.log('Shipping address', shippingAddress);

        const componentConfig = fastlane.getComponentConfiguration(fastlaneAuthResult);
        onCheckoutStep(componentConfig);
    };

    useEffect(() => {
        void loadFastlane().catch(error => {
            console.log(error);
        });
    }, []);

    if (!fastlane) {
        return null;
    }

    return (
        <div className="form-container">
            <h2>Merchant Checkout Page</h2>
            <CollectEmail fastlaneSdk={fastlane} onFastlaneLookup={handleFastlaneLookup} onEditEmail={handleOnEditEmail} />
            <hr />

            {fastlaneAuthResult?.authenticationState === 'succeeded' && (
                <ShippingWithFastlane
                    fastlaneSdk={fastlane}
                    address={fastlaneAuthResult?.profileData?.shippingAddress}
                    onCheckoutClick={handleOnCheckoutClick}
                />
            )}

            {fastlaneAuthResult?.authenticationState === 'not_found' && <Shipping onCheckoutClick={handleOnCheckoutClick} />}
        </div>
    );
};
