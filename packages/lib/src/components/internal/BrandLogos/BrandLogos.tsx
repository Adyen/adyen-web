import { h, Fragment } from 'preact';
import './BrandLogos.scss';

interface BrandLogosProps {
    brandLogo?: string | string[];
    alt?: string;
    classNamePrefix: string;
}

export const BrandLogos = ({ brandLogo, alt, classNamePrefix }: Readonly<BrandLogosProps>) => {
    const logos = [brandLogo].flat().filter(Boolean);

    if (!logos.length) return null;

    return (
        <div className={`${classNamePrefix}__brand-logos`}>
            {logos.map((logo, index) => (
                <Fragment key={logo}>
                    {index > 0 && <span className="adyen-checkout__brand-logos-separator" role="separator" aria-hidden="true" />}
                    <div className={`${classNamePrefix}__brand-logo-wrapper`}>
                        <img src={logo} alt={index === 0 ? alt : ''} className={`${classNamePrefix}__brand-logo`} />
                    </div>
                </Fragment>
            ))}
        </div>
    );
};
