import { h, Fragment } from 'preact';
import type { QRBrandLogo } from '../types';

interface QRBrandLogosProps {
    brandLogos: QRBrandLogo[];
}

export const QRBrandLogos = ({ brandLogos }: Readonly<QRBrandLogosProps>) => {
    const items = brandLogos.map((logo, index) => (
        <Fragment key={logo.src}>
            {index > 0 && (
                <span className="adyen-checkout__qr-loader__brand-logos-separator" aria-hidden="true" data-testid="qr-brand-logos-separator" />
            )}
            <div className="adyen-checkout__qr-loader__brand-logo-wrapper">
                <img src={logo.src} alt={logo.alt} className="adyen-checkout__qr-loader__brand-logo" />
            </div>
        </Fragment>
    ));

    return brandLogos.length > 1 ? <div className="adyen-checkout__qr-loader__brand-logos">{items}</div> : items;
};
