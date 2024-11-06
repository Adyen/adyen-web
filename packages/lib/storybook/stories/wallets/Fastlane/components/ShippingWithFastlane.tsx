import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import getAddressSummary from './utils/get-fastlane-address-summary';

import FastlaneSDK from '../../../../../src/components/PayPalFastlane/FastlaneSDK';

interface ShippingWithFastlaneProps {
    fastlaneSdk: FastlaneSDK;
    address: any;
    onCheckoutClick: () => void;
}

export const ShippingWithFastlane = ({ fastlaneSdk, address, onCheckoutClick }: ShippingWithFastlaneProps) => {
    const [addressSummary, setAddressSummary] = useState<string>(null);

    useEffect(() => {
        const summary = getAddressSummary(address);
        setAddressSummary(summary);
    }, [address]);

    const handleShippingClick = async () => {
        const data = await fastlaneSdk.showShippingAddressSelector();
        console.log(data);

        if (data.selectionChanged) {
            const summary = getAddressSummary(data.selectedAddress);
            setAddressSummary(summary);
        }
    };

    const handleCheckoutClick = () => {
        onCheckoutClick();
    };

    return (
        <div>
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
        </div>
    );
};
