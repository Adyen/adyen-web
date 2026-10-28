import { h, Fragment } from 'preact';

interface QRBrandLogosProps {
    brandLogo?: string | string[];
    alt?: string;
}

export const QRBrandLogos = ({ brandLogo, alt }: Readonly<QRBrandLogosProps>) => {
    const logos = [brandLogo].flat().filter(Boolean);

    const items = logos.map((logo, index) => (
        <Fragment key={logo}>
            {index > 0 && <span className="adyen-checkout__qr-loader__brand-logos-separator" role="separator" aria-hidden="true" />}
            <div className="adyen-checkout__qr-loader__brand-logo-wrapper">
                <img src={logo} alt={index === 0 ? alt : ''} className="adyen-checkout__qr-loader__brand-logo" />
            </div>
        </Fragment>
    ));

    return logos.length > 1 ? <div className="adyen-checkout__qr-loader__brand-logos">{items}</div> : items;
};
