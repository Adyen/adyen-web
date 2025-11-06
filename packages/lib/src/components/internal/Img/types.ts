import { h } from 'preact';

export interface ImgProps extends h.JSX.HTMLAttributes<HTMLImageElement> {
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
