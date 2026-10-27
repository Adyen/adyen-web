import { h } from 'preact';
import Spinner from '../../Spinner';
import { BrandLogos } from '../../BrandLogos';

interface QRLoaderPendingStateProps {
    brandLogo?: string | string[];
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
            <BrandLogos brandLogo={brandLogo} alt={brandName} classNamePrefix="adyen-checkout__qr-loader" />
            <Spinner />
        </div>
    );
};
