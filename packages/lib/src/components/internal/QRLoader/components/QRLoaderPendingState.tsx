import { h } from 'preact';
import { useCoreContext } from '../../../../core/Context/CoreProvider';
import { useA11yReporter } from '../../../../core/Errors/useA11yReporter';
import Spinner from '../../Spinner';

interface QRLoaderPendingStateProps {
    brandLogo?: string;
    brandName?: string;
}

/**
 * Rendered while QRLoader is waiting for the initial payment status check to resolve.
 * Announces the loading status to screen readers, since the spinner itself has no accessible name.
 */
export const QRLoaderPendingState = ({ brandLogo, brandName }: Readonly<QRLoaderPendingStateProps>) => {
    const { i18n } = useCoreContext();

    useA11yReporter(i18n.get('loading'));

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
