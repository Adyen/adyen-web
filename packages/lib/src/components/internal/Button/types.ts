import { h, Ref } from 'preact';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'action' | 'link' | 'iconOnly';

export interface ButtonProps {
    status?: string;
    /**
     * Class name modifiers will be used as: `adyen-checkout__button--${modifier}`
     */
    classNameModifiers?: string[];
    variant?: ButtonVariant;
    disabled?: boolean;
    label?: string | h.JSX.Element;
    onClickCompletedLabel?: string | h.JSX.Element;
    ariaLabel?: string;
    ariaDescribedBy?: string;
    secondaryLabel?: string;
    icon?: string;
    onClickCompletedIcon?: string;
    inline?: boolean;
    href?: string;
    target?: string;
    rel?: string;
    onClick?: (e: h.JSX.TargetedMouseEvent<HTMLButtonElement>, callbacks?: { complete?: () => void }) => void;
    onKeyDown?: (event: KeyboardEvent) => void;
    onKeyPress?: (event: KeyboardEvent) => void;
    buttonRef?: Ref<HTMLButtonElement>;
    onMouseEnter?: (event: MouseEvent) => void;
    onMouseLeave?: (event: MouseEvent) => void;
    onFocus?: (event: FocusEvent) => void;
    onBlur?: (event: FocusEvent) => void;
}

export interface ButtonState {
    completed?: boolean;
}
