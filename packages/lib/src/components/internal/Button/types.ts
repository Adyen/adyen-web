export interface ButtonProps {
    status?: string;
    /**
     * Class name modifiers will be used as: `adyen-checkout__image--${modifier}`
     */
    classNameModifiers?: string[];

    variant: 'primary' | 'secondary' | 'ghost' | 'action';

    disabled?: boolean;
    label?: string;
    icon?: string;
    // secondary?: boolean;
    inline?: boolean;
    href?: string;
    target?: string;
    rel?: string;
    onClick?: (e, callbacks) => void;
}

export interface ButtonState {
    completed?: boolean;
}
