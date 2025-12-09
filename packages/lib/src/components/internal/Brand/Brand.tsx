import { h } from 'preact';
import { useState } from 'preact/hooks';
import cx from 'classnames';
import Img from '../Img';
import './Brand.scss';

interface BrandProps {
    url: string;
    alt: string;
    wrapperClassName?: string;
    imgClassName?: string;
    showOnError?: boolean;
}

const Brand = ({ url, alt, wrapperClassName = '', imgClassName = '', showOnError }: BrandProps) => {
    const [hasError, setHasError] = useState(false);
    const classesOnError = showOnError ? {} : { 'adyen-checkout-brand-wrapper--error': hasError };
    const classes = cx('adyen-checkout-brand-wrapper', wrapperClassName, classesOnError);

    return (
        <span className={classes}>
            <Img className={imgClassName} src={url} alt={alt} onError={() => setHasError(true)} />
        </span>
    );
};

export default Brand;
