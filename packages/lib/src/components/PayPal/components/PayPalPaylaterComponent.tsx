import { h } from 'preact';

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
        setComponentRef
    });

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
                    onError={onError}
                />
            )}
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
        </div>
    );
};
