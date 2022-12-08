import { useEffect, useState } from 'preact/hooks';

type UseTrapFocusProps = {
    rootElement?: HTMLElement;
    /**
     * Element that must be focused when the hook is executed. If no element is passed, the first focusable child
     * element of the root element will be focused
     */
    focusFirst?: HTMLElement;
    /**
     * Can be used to conditionally disable the trap mechanism
     */
    shouldTrap?: boolean;
};

const KEYCODE_TAB = 9;
const FOCUSABLE_ELEMENTS =
    'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])';

/**
 * Hook used to trap the focus within the specific element and its child nodes.
 */
const useTrapFocus = ({ rootElement, focusFirst, shouldTrap = true }: UseTrapFocusProps): void => {
    const [firstFocusableEl, setFirstFocusableEl] = useState<HTMLElement>(focusFirst);

    useEffect(() => {
        if (!shouldTrap) return;
        firstFocusableEl?.focus();
    }, [firstFocusableEl, shouldTrap]);

    useEffect(() => {
        if (!shouldTrap) return;

        const focusableEl: NodeListOf<HTMLElement> = rootElement.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS);

        const firstFocusableEl: HTMLElement = focusableEl[0];
        const lastFocusableEl: HTMLElement = focusableEl[focusableEl.length - 1];

        setFirstFocusableEl(focusFirst || firstFocusableEl);

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

        rootElement.addEventListener('keydown', trapFocus);

        return () => {
            setFirstFocusableEl(null);
            rootElement.removeEventListener('keydown', trapFocus);
        };
    }, [rootElement, focusFirst, shouldTrap]);
};

export { useTrapFocus };
