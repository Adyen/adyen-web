import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import FastlaneSDK from '../../../../../src/components/PayPalFastlane/FastlaneSDK';
import type { FastlaneAuthenticatedCustomerResult } from '../../../../../src/components/PayPalFastlane/types';

interface CollectEmailProps {
    fastlaneSdk: FastlaneSDK;
    onFastlaneLookup: (authResult: FastlaneAuthenticatedCustomerResult) => void;
    onEditEmail: () => void;
}

export const CollectEmail = ({ fastlaneSdk, onFastlaneLookup, onEditEmail }: CollectEmailProps) => {
    const [email, setEmail] = useState<string>(null);
    const [viewOnly, setViewOnly] = useState<boolean>(false);

    const renderWatermark = async () => {
        await fastlaneSdk.mountWatermark('#watermark-container');
    };

    const handleEmailInput = event => {
        setEmail(event.currentTarget.value);
    };

    const handleEditEmail = () => {
        setViewOnly(false);
        onEditEmail();
    };

    const handleButtonClick = async () => {
        try {
            const authResult = await fastlaneSdk.authenticate(email);
            onFastlaneLookup(authResult);
            setViewOnly(true);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        void renderWatermark();
    }, []);

    return (
        <section>
            <div className="section_header">
                <h3>Customer</h3>
                {viewOnly && (
                    <button className="button" type="button" onClick={handleEditEmail}>
                        Edit
                    </button>
                )}
            </div>
            <div className="email-container">
                <div className="email-input-wrapper">
                    <input
                        disabled={viewOnly}
                        className="input-field"
                        value={email}
                        name="email"
                        type="email"
                        placeholder="Email"
                        autoComplete="email"
                        onInput={handleEmailInput}
                    />
                    <div id="watermark-container"></div>
                </div>

                {!viewOnly && (
                    <button className="button" type="button" onClick={handleButtonClick}>
                        Continue
                    </button>
                )}
            </div>
            {!viewOnly && <button onClick={() => setEmail('test1@awesome.com')}>Fill in valid email</button>}
        </section>
    );
};
