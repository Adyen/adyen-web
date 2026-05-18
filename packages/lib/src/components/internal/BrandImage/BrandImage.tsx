import { h } from 'preact';
import { useState } from 'preact/hooks';
import cx from 'classnames';
import Img from '../Img';
import './BrandImage.scss';

interface BrandImageProps {
    src: string;
    alt: string;
    wrapperClassName?: string;
    imgClassName?: string;
    showOnError?: boolean;
}

export const BrandImage = ({ src, alt, wrapperClassName = '', imgClassName = '', showOnError }: Readonly<BrandImageProps>) => {
    const [hasError, setHasError] = useState(false);
    const classesOnError = showOnError ? {} : { 'adyen-checkout-brand-wrapper--error': hasError };
    const classes = cx('adyen-checkout-brand-wrapper', wrapperClassName, classesOnError);

    return (
        <span className={classes} data-testid="brand-image-wrapper">
            <Img className={imgClassName} src={src} alt={alt} onError={() => setHasError(true)} />
        </span>
    );
};
