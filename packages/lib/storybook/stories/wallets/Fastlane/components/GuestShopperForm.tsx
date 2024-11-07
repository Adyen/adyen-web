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
    onCheckoutStep(fastlane: FastlaneSDK, fastlaneData: any, shippingAddress: any): void;
}

export const GuestShopperForm = ({ onCheckoutStep }: GuestShopperFormProps) => {
    const [fastlane, setFastlane] = useState<FastlaneSDK>(null);
    const [fastlaneLookupData, setFastlaneLookupData] = useState<FastlaneAuthenticatedCustomerResult>(null);

    const loadFastlane = async () => {
        const sdk = await initializeFastlane({
            clientKey: 'test_JC3ZFTA6WFCCRN454MVDEYOWEI5D3LT2', // Joost clientkey
            environment: 'test'
        });
        setFastlane(sdk);
    };

    const handleOnEditEmail = () => {
        setFastlaneLookupData(null);
    };

    const handleFastlaneLookup = data => {
        setFastlaneLookupData(data);
    };

    const handleOnCheckoutClick = (shippingAddress?: any) => {
        onCheckoutStep(fastlane, fastlaneLookupData, shippingAddress);
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

            {fastlaneLookupData?.authenticationState === 'succeeded' && (
                <ShippingWithFastlane
                    fastlaneSdk={fastlane}
                    address={fastlaneLookupData?.profileData?.shippingAddress}
                    onCheckoutClick={handleOnCheckoutClick}
                />
            )}

            {fastlaneLookupData?.authenticationState === 'not_found' && <Shipping onCheckoutClick={handleOnCheckoutClick} />}
        </div>
    );
};
