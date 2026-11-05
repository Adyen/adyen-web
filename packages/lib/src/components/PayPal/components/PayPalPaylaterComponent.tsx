import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { usePayPalStatus } from '../hooks/usePayPalStatus';
import { PayPalMessaging } from './PayPalMessaging';
import { PayPalPayLaterButton } from './PayPalPayLaterButton';
import { PayPalProcessingSpinner } from './PayPalProcessingSpinner';
import { PayPalSpinner } from './PayPalSpinner';
import { PayPalComponentV6Props } from './types';
import { PayPalFetchContentOptions } from '../paypal-js-types';

import styles from './PayPalPaylaterComponent.module.scss';

export const PayPalPaylaterComponent = ({
    paypalService,
    commit = true,
    presentationModeOptions,
    hidePayPalMessaging,
    messagingContentOptions,
    countryCode,
    onSubmit,
    onApprove,
    onShippingAddressChange,
    onShippingOptionsChange,
    onCancel,
    onError,
    setComponentRef
}: Readonly<
    Omit<PayPalComponentV6Props, 'style' | 'vault'> & {
        hidePayPalMessaging?: boolean;
        countryCode?: string;
        messagingContentOptions?: Pick<PayPalFetchContentOptions, 'logoType' | 'logoPosition' | 'textColor'>;
    }
>) => {
    const { status, handleOnApprove } = usePayPalStatus({
        paypalService,
        onApprove,
        setComponentRef,
        waitForEligibility: false
    });
    const [isFundingSourceEligibilityReady, setIsFundingSourceEligibilityReady] = useState<boolean>(false);

    useEffect(() => {
        let isCurrent = true;

        paypalService
            .isFundingSourceEligibilityReady()
            .then(() => {
                if (isCurrent) {
                    setIsFundingSourceEligibilityReady(true);
                }
            })
            .catch(() => {
                // Eligibility check failed, but we don't need to handle it here
            });

        return () => {
            isCurrent = false;
        };
    }, [paypalService]);

    if (status === 'pending') {
        return <PayPalSpinner />;
    }

    if (status === 'processing') {
        return <PayPalProcessingSpinner withoutReviewPage={commit} />;
    }

    return (
        <div className={styles.payPalPaylaterComponent}>
            {!hidePayPalMessaging && (
                <PayPalMessaging
                    paypalService={paypalService}
                    countryCode={countryCode}
                    messagingContentOptions={messagingContentOptions}
                    className={isFundingSourceEligibilityReady ? undefined : styles.payPalMessagingHidden}
                    onError={onError}
                />
            )}
            {isFundingSourceEligibilityReady ? (
                <PayPalPayLaterButton
                    paypalService={paypalService}
                    presentationModeOptions={presentationModeOptions}
                    commit={commit}
                    onSubmit={onSubmit}
                    onApprove={handleOnApprove}
                    onError={onError}
                    onCancel={onCancel}
                    onShippingAddressChange={onShippingAddressChange}
                    onShippingOptionsChange={onShippingOptionsChange}
                />
            ) : (
                <PayPalSpinner />
            )}
        </div>
    );
};
