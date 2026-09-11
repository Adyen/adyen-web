import { h } from 'preact';
import Spinner from '../../Spinner';

interface QRLoaderPendingStateProps {
    brandLogo?: string;
    brandName?: string;
}

/**
 * Rendered while QRLoader is waiting for the initial payment status check to resolve.
 * The loading status is announced by QRLoader, which stays mounted across the transition and so
 * can also announce that loading has finished.
 */
export const QRLoaderPendingState = ({ brandLogo, brandName }: Readonly<QRLoaderPendingStateProps>) => {
    return (
        <div className="adyen-checkout__qr-loader">
            {brandLogo && (
                <div className="adyen-checkout__qr-loader__brand-logo-wrapper">
                    <img alt={brandName} src={brandLogo} className="adyen-checkout__qr-loader__brand-logo" />
                </div>
            )}
            <Spinner />
        </div>
    );
};
