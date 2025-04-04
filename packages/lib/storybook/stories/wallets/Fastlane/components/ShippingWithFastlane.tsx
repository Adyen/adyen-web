import { h } from 'preact';
import { useState } from 'preact/hooks';
import getAddressSummary from './utils/get-fastlane-address-summary';

import FastlaneSDK from '../../../../../src/components/PayPalFastlane/FastlaneSDK';
import type { FastlaneShipping } from '../../../../../src/components/PayPalFastlane/types';

interface ShippingWithFastlaneProps {
    fastlaneSdk: FastlaneSDK;
    address: FastlaneShipping;
    onCheckoutClick: (shippingAddress?: any) => void;
}

export const ShippingWithFastlane = ({ fastlaneSdk, address, onCheckoutClick }: ShippingWithFastlaneProps) => {
    const [addressSummary, setAddressSummary] = useState<string>(getAddressSummary(address));
    const [shippingAddress, setShippingAddress] = useState<FastlaneShipping>(address);

    const handleShippingClick = async () => {
        const data = await fastlaneSdk.showShippingAddressSelector();

        if (data.selectionChanged) {
            const summary = getAddressSummary(data.selectedAddress);
            setAddressSummary(summary);
            setShippingAddress(data.selectedAddress);
        }
    };

    const handleCheckoutClick = () => {
        onCheckoutClick(shippingAddress);
    };

    return (
        <section className="shipping-section">
            <div className="section_header">
                <h3>Shipping Details</h3>

                {addressSummary && (
                    <button className="button" onClick={handleShippingClick}>
                        Edit
                    </button>
                )}
            </div>

            {addressSummary && (
                <div>
                    <div style={{ whiteSpace: 'pre-line' }}>{addressSummary}</div>
                    <button className="button" onClick={handleCheckoutClick}>
                        Checkout
                    </button>
                </div>
            )}
        </section>
    );
};
