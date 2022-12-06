import { useEffect } from 'preact/hooks';

type UseTrapFocusProps = {
    element?: HTMLElement;
};

const KEYCODE_TAB = 9;

const useTrapFocus = ({ element }: UseTrapFocusProps) => {
    useEffect(() => {
        if (!element) {
            return;
        }

        const focusabledEl: NodeListOf<HTMLElement> = element.querySelectorAll<HTMLElement>(
            'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'
        );

        const firstFocusableEl: HTMLElement = focusabledEl[0];
        const lastFocusableEl: HTMLElement = focusabledEl[focusabledEl.length - 1];

        const trapFocus = (event: KeyboardEvent): void => {
            const isTabPressed = event.key === 'Tab' || event.keyCode === KEYCODE_TAB;

            if (!isTabPressed) return;

            if (event.shiftKey && document.activeElement === firstFocusableEl) {
                lastFocusableEl.focus();
                event.preventDefault();
                return;
            }
            if (document.activeElement === lastFocusableEl) {
                firstFocusableEl.focus();
                event.preventDefault();
                return;
            }
        };

        element.addEventListener('keydown', trapFocus);
        console.log('Event created');

        return () => {
            console.log('Event removed');
            element.removeEventListener('keydown', trapFocus);
        };
    }, [element]);
};

export { useTrapFocus };
