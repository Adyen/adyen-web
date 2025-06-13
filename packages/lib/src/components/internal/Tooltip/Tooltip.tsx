import { h } from 'preact';
import { useState, useRef, useEffect, MutableRef } from 'preact/hooks';
import './Tooltip.scss';

const OFFSET = 8;
type TooltipPosition = 'top' | 'bottom';

interface TooltipProps {
    text: string;
    visible: boolean;
    anchorRef: MutableRef<HTMLElement>;
    id: string;
}

export function Tooltip({ text, id, visible, anchorRef }: TooltipProps) {
    const [style, setStyle] = useState({});
    const [position, setPosition] = useState<TooltipPosition>('top');
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!visible || !anchorRef.current || !tooltipRef.current) return;

        // Wait a tick to ensure DOM has mounted
        requestAnimationFrame(() => {
            const anchorEl = anchorRef.current;
            const tooltipEl = tooltipRef.current;
            const anchorRect = anchorEl.getBoundingClientRect();
            const containerRect = anchorEl.offsetParent?.getBoundingClientRect();

            if (!containerRect) return;

            const offsetTop = anchorRect.top - containerRect.top;
            const offsetLeft = anchorRect.left - containerRect.left;

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
                transform: 'translateX(-50%)'
            };

            if (newPosition === 'top') {
                newStyle.top = offsetTop - tooltipEl.offsetHeight - OFFSET;
            } else {
                newStyle.top = offsetTop + anchorRect.height + OFFSET;
            }

            setStyle(newStyle);
            setPosition(newPosition);
        });
    }, [visible, anchorRef, position]);

    return (
        visible && (
            <div inert id={id} role="tooltip" className={`adyen-checkout-tooltip adyen-checkout-tooltip-${position}`} ref={tooltipRef} style={style}>
                {text}
                <div className={`adyen-checkout-tooltip-arrow adyen-checkout-tooltip-arrow-${position}`} />
            </div>
        )
    );
}
