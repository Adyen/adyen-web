import { h, ImgHTMLAttributes } from 'preact';

export interface ImgProps extends ImgHTMLAttributes {
    backgroundUrl?: string;
    className?: string;
    /**
     * Class name modifiers will be used as: `adyen-checkout__image--${modifier}`
     */
    classNameModifiers?: string[];
    /**
     * Show the image even if it fails to load
     * @defaultValue false
     */
    showOnError?: boolean;
}
