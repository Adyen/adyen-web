import { h } from 'preact';
import './AwaitLogoContainer.scss';

type Logo = {
    name: string;
    src: string;
    alt: string;
};

export interface IAwaitLogoContainer {
    logos: Logo[];
}

function AwaitLogoContainer({ logos }: Readonly<IAwaitLogoContainer>) {
    return (
        <div className={'adyen-checkout-await-logo-container'}>
            {logos.map(logo => (
                <img
                    key={logo.name}
                    src={logo.src}
                    alt={logo.alt}
                    className={`adyen-checkout__await__brand-logo adyen-checkout-await-logo-${logo.name}`}
                />
            ))}
        </div>
    );
}

export default AwaitLogoContainer;
