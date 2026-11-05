import { h } from 'preact';
import Spinner from '../../Spinner';
import { QRBrandLogos } from './QRBrandLogos';
import type { QRBrandLogo } from '../types';

interface QRLoaderPendingStateProps {
    brandLogos: QRBrandLogo[];
}

/**
 * Rendered while QRLoader is waiting for the initial payment status check to resolve.
 * The loading status is announced by QRLoader, which stays mounted across the transition and so
 * can also announce that loading has finished.
 */
export const QRLoaderPendingState = ({ brandLogos }: Readonly<QRLoaderPendingStateProps>) => {
    return (
        <div className="adyen-checkout__qr-loader">
            <QRBrandLogos brandLogos={brandLogos} />
            <Spinner />
        </div>
    );
};
