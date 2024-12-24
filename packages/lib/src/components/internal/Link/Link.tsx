import { h } from 'preact';
import type { ComponentChildren } from 'preact';
import './Link.scss';

/**
 * Disclaimer: we don't follow Bento's design for Links. Checkout has its own colors
 */

interface LinkProps {
    to: string;
    children?: ComponentChildren;
}

const Link = ({ to, children }: LinkProps) => {
    // TODO: check classname adyen-checkout-link vs adyen-checkout__link
    return (
        <a className="adyen-checkout-link" href={to} target="_blank" rel="noopener noreferrer">
            {children}
        </a>
    );
};

export default Link;
