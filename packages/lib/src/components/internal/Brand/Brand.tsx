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

const Brand = ({ url, alt, wrapperClassName = '', imgClassName = '' }: BrandProps) => {
    const [hasError, setHasError] = useState(false);
    const classes = cx('adyen-checkout-brand-wrapper', wrapperClassName, { 'adyen-checkout-brand-wrapper--error': hasError });

    return (
        <span className={classes}>
            <Img className={imgClassName} src={url} alt={alt} onError={() => setHasError(true)} />
        </span>
    );
};

export default Brand;
