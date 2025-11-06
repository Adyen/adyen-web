import { h } from 'preact';
import cx from 'classnames';
import Img from '../Img';
import './Brand.scss';

interface BrandProps {
    url: string;
    alt: string;
    wrapperClassName?: string;
    imgClassName?: string;
}

const Brand = ({ url, alt, wrapperClassName = '', imgClassName = '' }: BrandProps) => {
    return (
        <span className={cx('adyen-checkout-brand-wrapper', [wrapperClassName])}>
            <Img className={imgClassName} src={url} alt={alt} />
        </span>
    );
};

export default Brand;
