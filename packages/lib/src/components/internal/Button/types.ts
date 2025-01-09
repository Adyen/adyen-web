import { h, Ref } from 'preact';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'action' | 'link';

export interface ButtonProps {
    status?: string;
    /**
     * Class name modifiers will be used as: `adyen-checkout__image--${modifier}`
     */
    classNameModifiers?: string[];
    variant?: ButtonVariant;
    disabled?: boolean;
    label?: string | h.JSX.Element;
    ariaLabel?: string;
    secondaryLabel?: string;
    icon?: string;
    inline?: boolean;
    href?: string;
    target?: string;
    rel?: string;
    onClick?: (e, callbacks) => void;
    onKeyDown?: (event: KeyboardEvent) => void;
    buttonRef?: Ref<HTMLButtonElement>;
}

export interface ButtonState {
    completed?: boolean;
}
