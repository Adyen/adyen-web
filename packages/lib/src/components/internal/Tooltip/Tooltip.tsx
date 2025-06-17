import { h } from 'preact';
import { useRef, useEffect, useState, MutableRef } from 'preact/hooks';
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
    const [isAnchorVisible, setIsAnchorVisible] = useState<boolean>(true);
    const [style, setStyle] = useState({});
    //visible = true;
    useEffect(() => {
        if (!visible || !anchorRef.current || !tooltipRef.current) return;

        const updatePosition = () => {
            const anchorEl = anchorRef.current;
            const tooltipEl = tooltipRef.current;
            const anchorRect = anchorEl.getBoundingClientRect();

            const offsetTop = anchorRect.top + window.scrollY;
            const offsetLeft = anchorRect.left + window.scrollX;
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
            newStyle.top = newPosition === 'top' ? offsetTop - tooltipEl.offsetHeight - OFFSET : offsetTop + anchorRect.height + OFFSET;

            setStyle(newStyle);
            setPosition(newPosition);
        };

        // We need {capture: true}, if the tooltip is placed inside scrollable containers because:
        // Scroll does not bubble. So if an element inside your page scrolls (like a <div> with overflow: scroll),
        // and you attach a scroll listener on the window without capture: true, it won’t catch those inner scrolls.
        window.addEventListener('scroll', updatePosition, { capture: true });
        window.addEventListener('resize', updatePosition);

        requestAnimationFrame(updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition, { capture: true });
            window.removeEventListener('resize', updatePosition);
        };
    }, [visible, anchorRef]);

    // Hide the tooltip if it's not in the viewport.
    useEffect(() => {
        if (!anchorRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsAnchorVisible(entry.isIntersecting);
            },
            {
                // consider the element is intercepting if it's 10% visible
                threshold: 0.1
            }
        );
        observer.observe(anchorRef.current);

        return () => {
            observer.disconnect();
        };
    }, [anchorRef]);

    return createPortal(
        <div
            id={id}
            role="tooltip"
            className={cx({
                'adyen-checkout-tooltip': true,
                'adyen-checkout-tooltip--hidden': !visible || !isAnchorVisible,
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
