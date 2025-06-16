import { h } from 'preact';
import { useRef, useEffect, useState, MutableRef } from 'preact/hooks';
// eslint-disable-next-line no-restricted-imports
import { createPortal } from 'preact/compat';
import cx from 'classnames';
import './Tooltip.scss';

const OFFSET = 8;
type TooltipPosition = 'top' | 'bottom';

interface TooltipProps<T extends HTMLElement = HTMLElement> {
    text: string;
    visible: boolean;
    anchorRef: MutableRef<T>;
    id: string;
}

export function Tooltip({ text, id, visible, anchorRef }: TooltipProps) {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<TooltipPosition>('top');
    const [style, setStyle] = useState({});

    useEffect(() => {
        if (!visible || !anchorRef.current || !tooltipRef.current) return;

        // Wait a tick to ensure DOM has mounted
        requestAnimationFrame(() => {
            const anchorEl = anchorRef.current;
            const anchorRect = anchorEl.getBoundingClientRect();
            const tooltipEl = tooltipRef.current;

            const offsetTop = anchorRect.top;
            const offsetLeft = anchorRect.left;
            const spaceAbove = anchorRect.top;
            const spaceBelow = window.innerHeight - anchorRect.bottom;

            let newPosition: TooltipPosition;

            if (spaceAbove >= tooltipEl.offsetHeight + OFFSET) {
                newPosition = 'top';
            } else if (spaceBelow >= tooltipEl.offsetHeight + OFFSET) {
                newPosition = 'bottom';
            } else {
                newPosition = spaceBelow > spaceAbove ? 'bottom' : 'top';
            }

            const newStyle: any = {
                position: 'absolute',
                left: offsetLeft + anchorRect.width / 2,
                transform: 'translateX(-50%)',
                willChange: 'opacity, visibility, transform'
            };

            if (newPosition === 'top') {
                newStyle.top = offsetTop - tooltipEl.offsetHeight - OFFSET;
            } else {
                newStyle.top = offsetTop + anchorRect.height + OFFSET;
            }

            setStyle(newStyle);
            setPosition(newPosition);
        });
    }, [visible, anchorRef]);

    return createPortal(
        <div
            id={id}
            role="tooltip"
            className={cx({
                'adyen-checkout-tooltip': true,
                'adyen-checkout-tooltip--hidden': !visible,
                [`adyen-checkout-tooltip--${position}`]: true
            })}
            ref={tooltipRef}
            style={style}
        >
            {text}
            <div className={`adyen-checkout-tooltip-arrow adyen-checkout-tooltip-arrow--${position}`} />
        </div>,
        document.body
    );
}
