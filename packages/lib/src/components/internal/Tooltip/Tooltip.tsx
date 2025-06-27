import { h } from 'preact';
import { useRef, useEffect, useState, useLayoutEffect } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import cx from 'classnames';
import './Tooltip.scss';
import { TooltipPosition, TooltipProps } from './types';

// 8px space between the target and the tooltip
const OFFSET = 8;

export function Tooltip(props: TooltipProps) {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<TooltipPosition>('top');
    const [isAnchorVisible, setIsAnchorVisible] = useState<boolean>(true);
    const [style, setStyle] = useState({});

    useLayoutEffect(() => {
        if (!props?.visible || !props?.anchorRef?.current || !tooltipRef.current) return;

        const updatePosition = () => {
            const anchorEl = props.anchorRef.current;
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
                willChange: 'transform'
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

        updatePosition();

        return () => {
            window.removeEventListener('scroll', updatePosition, { capture: true });
            window.removeEventListener('resize', updatePosition);
        };
    }, [props?.visible, props?.anchorRef]);

    // Hide the tooltip if it's not in the viewport.
    useEffect(() => {
        const anchor = props?.anchorRef?.current;
        if (!anchor) return;

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    setIsAnchorVisible(entry.isIntersecting);
                },
                { threshold: 0.1 }
            );
            observer.observe(anchor);

            return () => {
                observer.disconnect();
            };
        }
    }, [props?.anchorRef]);

    return createPortal(
        <div
            id={props.id}
            role="tooltip"
            className={cx({
                'adyen-checkout-tooltip': true,
                'adyen-checkout-tooltip--hidden': !props.visible || !isAnchorVisible,
                [`adyen-checkout-tooltip--${position}`]: true
            })}
            ref={tooltipRef}
            style={style}
        >
            {props.text}
            <div className={`adyen-checkout-tooltip-arrow adyen-checkout-tooltip-arrow--${position}`} />
        </div>,
        document.body
    );
}
