interface SelectItem {
    id: string;
    name: string;
    icon?: string;
}

export interface SelectBoxProps {
    className: string;
    classNameModifiers: string[];
    isInvalid: boolean;
    items: SelectItem[];
    onChange: (e: Event) => void;
    placeholder: string;
    readonly: boolean;
    selected: string;
}

export interface SelectBoxState {
    toggleDropdown: boolean;
}
