import { h } from 'preact';
import { useState } from 'preact/hooks';
import cx from 'classnames';
import Img from '../Img';
import './BrandImage.scss';
import { ElementType } from 'preact/compat';

interface BrandImageProps {
    src: string;
    alt: string;
    wrapperClassName?: string;
    imgClassName?: string;
    showOnError?: boolean;
    as?: ElementType;
}

export const BrandImage = ({ src, alt, wrapperClassName = '', imgClassName = '', showOnError, as = 'span' }: Readonly<BrandImageProps>) => {
    const [hasError, setHasError] = useState(false);
    const classesOnError = showOnError ? {} : { 'adyen-checkout-brand-wrapper--error': hasError };
    const classes = cx('adyen-checkout-brand-wrapper', wrapperClassName, classesOnError);

    const Component = as ?? 'span';

    return (
        <Component className={classes} data-testid="brand-image-wrapper">
            <Img className={imgClassName} src={src} alt={alt} onError={() => setHasError(true)} />
        </Component>
    );
};
